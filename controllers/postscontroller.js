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
    
    const posts =await Post.find();

    res.status(200).json({
        status:'success',
        results:posts.length,
        data:posts
    });
});

// view specific post
exports.getpost=catchasync(async (req,res)=>{

    const post = await Post.findById(req.params.id);

    if(!post)
    return next(new AppError('No post found with id',404));

    res.status(200).json({
        status:'success',
        results:post.length,
        data:post
    });
});

