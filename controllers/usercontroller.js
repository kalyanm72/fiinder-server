const User = require('../models/usermodel');
const catchasync = require('../utils/catchasync');
const AppError = require('../utils/apperror');

exports.getallusers=catchasync(async (req,res,next)=>{
    
        // console.log(req.body);
        const users=await User.find().select('+superuser +violation');

        if(!users)
        return next(new AppError('no users available',404));

        res.status(200).json({
            status:'success',
            length:users.length,
            data:users
        });

});


exports.addclaims = catchasync(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user.id,{$push:{claimedposts:req.post.id}},{
        runValidators:true,
        new:true
    });

    if(!user)
    return next(new AppError('No user found with id'));

    res.status(200).json({
        status:'success',
        data:{
            post,
            user
        }
    });

});

exports.addreport = catchasync(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user.id,{$push:{reportedposts:req.post.id}},{
        runValidators:true,
        new:true
    });

    if(!user)
    return next(new AppError('No user found with id'));

    res.status(200).json({
        status:'success',
        data:{
            post,
            user
        }
    });

});


exports.getuserid = catchasync(async (req,res,next)=>{
    
        let id='5';
        // superuser route
        if(req.params.id)
        id = req.params.id;

        // claimed person route
        else if(req.body.id)
        id=req.body.id;

        const user=await User.findById(id);

        if(!user)
        return next(new AppError('No user found with id',404));

        res.status(200).json({
            status:'success',
            data:user
        });
    
});

// only super users can create super users
exports.createuser = catchasync(async(req,res,next)=>{
      if(!req.user.superuser)
      return next(new AppError('This route is only for authorized users',403));

      const newUser = await User.create({
        email:req.body.email,
            password:req.body.password,
            profile:req.body.profile,
            mobilenum:req.body.mobilenum,
            rollno:req.body.rollno,
            passwordconf:req.body.passwordconf,
            superuser:true
    });

    // dont display password
    newUser.password=undefined;
    res.status(201).json({
        status:'success',
        newUser
    });


});


const filterObj=(obj,...fields)=>{
    let newObj={};
    Object.keys(obj).forEach(el=>{
      if(fields.includes(el))
      newObj[el]=obj[el]
    });
    return  newObj;
  }

exports.updateprofile = catchasync(async(req,res,next)=>{

    if(req.body.password||req.body.passwordconf)
    return next(new AppError('Cannot update password through this route',403));

    
        const filteredbody=filterObj(req.body,'email','profile','mobilenum');

        const user = await User.findByIdAndUpdate(req.user.id,filteredbody,{
            new:true,
            runValidators:true
        });

        if(!user){
            return next(new AppError('cannot update details ',404));
        }

        res.status(200).json({
            status:'success',
            user
        });
    
});

exports.addnewpost=catchasync( async(req,res,next)=>{
    

        const user = await User.findByIdAndUpdate(req.user.id,{$push:{posts:req.post.id}},{
            new:true,
            runValidators:true
        });

        if(!user)
        return next(new AppError('cannot update posts of user',404));

        res.status(201).json({
            status:'success',
            data:req.post
        });
    
});


const banduration=[10,20,30,60,120];

exports.banuser =catchasync( async(req,res,next)=>{

        
        const user = await User.findByIdAndUpdate(req.params.id,{violation:{
            banned:true,
            bantime:new Date(Date.now()+banduration[req.body.banseverity]*86400000)
        }},
        {
        new:true,
        runValidators:true});

        if(!user){
            return next(new AppError('cannot ban user',404));
        }
        
        res.status(200).json({
            status:'success',
            data:user
        });
    

});

exports.unbanuser =catchasync( async(req,res,next)=>{
    
    const user = await User.findByIdAndUpdate(req.params.id,{violation:{
        banned:false
    }},{
    new:true,
    runValidators:true});

    if(!user){
        return next(new AppError('cannot unban user',404));
    }
    
    res.status(200).json({
        status:'success',
        data:user
    });
    
});
