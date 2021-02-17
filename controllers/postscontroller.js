const Post = require('../models/postmodel');
const AppError = require('../utils/apperror');
const catchasync = require('../utils/catchasync');


// add new post
exports.newpost=catchasync(async (req,res,next)=>{

    let newPost;
    const canpost = req.user.canpost();

    req.body.owner=req.user.id;
    if(canpost.access===true)
    newPost=await Post.create(req.body);
    else
    return next(new AppError(canpost.message,403))

    req.post=newPost;
    next();
});

const canalterpost=(posts,postid)=>{
    let flg=0;
    posts.forEach(el => {
        if(el._id==postid)
        flg= 1;
    });
    return flg;
}

// modify post
exports.updatepost=catchasync(async(req,res,next)=>{


    if(!canalterpost(req.user.posts,req.params.id))
    return next(new AppError('You can only update your posts'));

    const post = await Post.findByIdAndUpdate(req.params.id,req.body,{
        runValidators:true,
        new:true
    });

    if(!post)
    return next(new AppError('No post found with id',404));

    res.status(200).json({
        status:'success',
        post
    });

    
});

// delete post
exports.deletepost=catchasync(async (req,res,next)=>{

    if(!canalterpost(req.user.posts,req.params.id))
    return next(new AppError('You can only delete your posts'));
    
    const post = await Post.findByIdAndDelete(req.params.id)

    if(!post)
    return next(new AppError('No post found with id',404));

    res.status(204).json({
        status:'success'
    });

    
});

// view all post
exports.getallposts=catchasync(async (req,res)=>{
    
    const posts =await Post.find().select('-__v');

    // check if post is claimed or reported and mark it
    res.status(200).json({
        status:'success',
        results:posts.length,
        data:posts
    });
});

// view specific post
exports.getpost=catchasync(async (req,res)=>{
                                                     // get claims reports of his posts 
    let flg=false
    if(req.user && req.user.posts)
    flg = req.user.posts.includes(req.params.id)?true:false;

    const post = flg?await Post.findById(req.params.id).populate('claims')
                                                       .populate('reports')
                    :await Post.findById(req.params.id).select('-claims -reports -__v');

    if(!post)
    return next(new AppError('No post found with id',404));

    res.status(200).json({
        status:'success',
        results:post.length,
        data:post
    });
});

// claim a post
exports.claim = catchasync(async(req,res,next)=>{

    // mail inform owner about claim

    const access= req.user.canpost();
    if(access.access===false)
    return next(new AppError(access.message,204));

    const post = await Post.findByIdAndUpdate(req.params.id,{$addToSet:{claims:req.user.id}},{
        runValidators:true,
        new:true
    });

    if(!post)
    return next(new AppError('Cannot claim post',404));

    req.post=post;

    next();

});

exports.report = catchasync(async(req,res,next)=>{

    const access = req.user.canpost();

    if(access.access===false)
    return next(new AppError(access.message,204));

    // mail inform owner about report
    const post = await Post.findByIdAndUpdate(req.params.id,{$addToSet:{reports:req.user.id}},{
        runValidators:true,
        new:true
    });

    if(!post)
    return next(new AppError('Cannot claim post',404));

    req.post=post;

    next();

});


exports.didclaim = catchasync(async (req,res,next)=>{
    
    const post = await Post.findById(req.params.postid).select('+claims +reports');

    if(post.claims.includes(req.user.id)||post.reports.includes(req.user.id)){
        
        req.body.id = post.owner._id;
        console.log(req.body.id);
        return next();
    }

    return next(new AppError('Cannot obtain details as post not claimed',204));
});