const User = require('../models/usermodel');
const catchasync = require('../utils/catchasync');
const AppError = require('../utils/apperror');
const jwt = require('jsonwebtoken');
const { stat } = require('fs');
const { promisify } = require('util');

const signtoken=id=>{
    return jwt.sign({id:id},process.env.JWT_KEY,{expiresIn:process.env.JWT_TIMER});
    
};
  
const logintheuser=async (statuscode,user,res)=>{
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
 
exports.signup = catchasync( async(req,res)=>{
        const newUser = await User.create({
            email:req.body.email,
            password:req.body.password,
            profile:req.body.profile,
            mobilenum:req.body.mobilenum,
            rollno:req.body.rollno,
            passwordconf:req.body.passwordconf
        });
        
        logintheuser(201,newUser,res);
});

exports.login = catchasync(async (req,res,next)=>{
    const {email,password} = req.body;
    if(!email||!password)
    return next(new AppError('email or password not provided',400));

    const user = await User.findOne({email:email}).select('+password +superuser');

    // console.log(password);
    // use await due to bcrypt
    if(!user || !await user.correctpassword(password,user.password))
    return next(new AppError('Email or Password is invalid',401));

    logintheuser(200,user,res);

});


exports.protect = catchasync(async(req,res,next)=>{
    let token;

    
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer'))
    token=req.headers.authorization.split(' ')[1];
    else if(req.cookies.jwt)
    token=req.cookies.jwt;

    if(!token)
    return next(new AppError('User not logged in',401));

    const org_token= await promisify(jwt.verify)(token,process.env.JWT_KEY);
    // console.log(org_token)

    const user = await User.findById(org_token.id).select('+superuser +posts +claimedposts +reportedposts');

    if(!user)
    return next(new AppError('User no longer exists',401));

    if(user.changedpassword(org_token.iat))
    return next(new AppError('User has changed Password',401));

    req.user=user;

    next();
}); 

exports.restrictto = (req,res,next)=>{
    if(req.user.superuser)
    return next();
    return next(new AppError('Route Unauthorized',403));
}
