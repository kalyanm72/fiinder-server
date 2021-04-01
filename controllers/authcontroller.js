const User = require('../models/usermodel');
const catchasync = require('../utils/catchasync');
const AppError = require('../utils/apperror');
const jwt = require('jsonwebtoken');
const { stat } = require('fs');
const { promisify } = require('util');
const fs = require('fs');
const { token } = require('morgan');
const Email = require('../utils/email');
const crypto = require('crypto');

const signtoken=id=>{
    return jwt.sign({id:id},process.env.JWT_KEY,{expiresIn:process.env.JWT_TIMER});
    
};
  
const logintheuser= async (statuscode,user,res)=>{
    const token = signtoken(user._id);

    const cookieoptions={
        expire:new Date(Date.now()+process.env.JWT_TIMER*1000*86400),
        httpOnly:true
    };

    if(process.env==='production')
    cookieoptions.secure=true;

    res.cookie('jwt',token,cookieoptions);
    user.password=undefined;


    res.status(statuscode).json({
        status:'success',
        user,
        token
    });

};


exports.signup = catchasync( async(req,res,next)=>{

        const newUser = await User.create({
            email:req.body.email,
            password:req.body.password,
            profile:req.body.profile,
            mobilenum:req.body.mobilenum,
            rollno:req.body.rollno,
            passwordconf:req.body.passwordconf
        });
        
       
        try{   
            // send user and url to be clicked
           await new Email(newUser,`https://google.com`).sendWelcome();
           
        }
        catch(err){
            // console.log(err);
            return next(new AppError(`mail could not be sent ${err}`));   
        }
        logintheuser(201,newUser,res);
        
});

exports.login = catchasync(async (req,res,next)=>{
    const {email,password} = req.body;
    if(!email||!password)
    return next(new AppError('email or password not provided',400));

    const user = await User.findOne({email:email}).select('+password +superuser +posts +claimedposts +reportedposts');

    // console.log(password);
    // use await due to bcrypt
    if(!user || !await user.correctpassword(password,user.password))
    return next(new AppError('Email or Password is invalid',401));

    logintheuser(200,user,res);

});

const checkauthorization =async token =>{

    const org_token= await promisify(jwt.verify)(token,process.env.JWT_KEY);

    const user = await User.findById(org_token.id).select('+superuser +posts +claimedposts +reportedposts');

    return {user,org_token};
}

exports.protect = catchasync(async(req,res,next)=>{

    let token;
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer'))
    token=req.headers.authorization.split(' ')[1];
    else if(req.cookies.jwt)
    token=req.cookies.jwt;

    if(!token)
    return next(new AppError('User not logged in',401));

    const checkauthorizationres = await checkauthorization(token);

    const user = checkauthorizationres.user;
    const org_token = checkauthorizationres.org_token;

    if(!user)
    return next(new AppError('User no longer exists',401));

    if(user.changedpassword(org_token.iat))
    return next(new AppError('User has changed Password',401));

    req.user=user;

    // console.log(req.user);

    next();
}); 

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({ status: 'success' });
  };

  exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_KEY);

        // 2) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          res.status(401).json({
              status:'fail',
              message:'user not loggedin'
          });
          return 0;
        }
  
        // 3) Check if user changed password after the token was issued
        if (currentUser.changedpassword(decoded.iat)) {
            res.status(401).json({
                status:'fail',
                message:'user changed password'
            });
            return 0;
        }
  
        // THERE IS A LOGGED IN USER
        res.status(200).json({
            status:'success',
            user:currentUser
        });
        
      } catch (err) {
        return next(new AppError('cannot login',401));
      }
    }
    next();
  };

exports.softprotect=catchasync( async (req,res,next)=>{
    if(req.cookies.jwt||(req.headers.authorization&&req.headers.authorization.startsWith('Bearer'))){
        let token;
         if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer'))
        token=req.headers.authorization.split(' ')[1];
        else if(req.cookies.jwt)
        token=req.cookies.jwt;

        const checkauthorizationres = await checkauthorization(token);

        const user = checkauthorizationres.user;

        if(user)
        req.user=user;
    }
    next();
});

exports.restrictto = (req,res,next)=>{
    if(req.user.superuser===true)
    return next();
    return next(new AppError('Route Unauthorized',403));
}


exports.forgotpassword=catchasync( async(req,res,next)=>{
    const user = await User.findOne({email:req.params.email});

    if(!user)
    return next(new AppError('No user exist with such email',404));

    const token = user.resettoken();
    
    await user.save({validateBeforeSave:false});

    try{
        
        // change the url to frontend password reset route
        const reseturl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${token}`;

        await new Email(user,reseturl).sendPasswordReset();
        res.status(200).json({
            status:'success',
            message:'email sent successfully'
        });
    }catch(err){
        
        user.passwordresettoken=undefined;
        user.passwordresetexpire=undefined;

        await user.save({validateBeforeSave:false});
        return next(new AppError(`Mail cannot be sent ${err}`));
    }
    
});

exports.resetpassword=catchasync( async (req,res,next)=>{
    
    const hashedtoken=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordresettoken:hashedtoken});

    if(!user)
    return next(new AppError('Password Reset Link Invalid',403));

    user.password=req.body.password;
    user.passwordconf=req.body.passwordconf;

    user.passwordresettoken=undefined;
    user.passwordresetexpire=undefined;

    await user.save();

    logintheuser(200,user,res);
    
    // change url to frontend homepage
    await new Email(user,'https://fiinder.com/resetpassword').sendPasswordChanged();
    
});

exports.updatepassword=async(req,res,next)=>{

    const user = await User.findById(req.user.id);

    if(!user)
    return next(new AppError('No user found',404));
    
    if(!user.correctpassword(req.body.passwordCurrent,user.password))
    return next(new AppError('Incorrect password entered',401));

    user.password=req.body.password;
    user.passwordconf=req.body.passwordconf;
    await user.save();
    try{
        await new Email(user,'https://fiinder.com/resetpassword').sendPasswordChanged();
        logintheuser(200,user,res);
    }
    catch(err){
        return next(new AppError(`Mail cannot be sent ${err}`));
    }
    // logg user in again sen new jwt
    
}