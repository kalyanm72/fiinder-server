const Post = require('../models/postmodel');
const AppError = require('../utils/apperror');
const catchasync = require('../utils/catchasync');
const ApiFeatures = require('../utils/apiFeatures');


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
    return next(new AppError('You can only update your posts',400));

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
    return next(new AppError('You can only delete your posts',400));
    
    const post = await Post.findByIdAndDelete(req.params.id)

    if(!post)
    return next(new AppError('No post found with id',404));

    res.status(204).json({
        status:'success'
    });

    
});

// view all post
exports.getallposts=catchasync(async (req,res)=>{
    
    const features = new ApiFeatures(Post.find(),req.query).filter()
                                                        .paginate()
                                                        .sort()
                                                        .limit();

    const posts = await features.query;

    // console.log(req.query);

    // check if post is claimed or reported and mark it
    res.status(200).json({
        status:'success',
        results:posts.length,
        data:posts
    });
});


exports.getmyposts=(req,res,next)=>{
    
    req.params.id=req.user.id;

    next();
}
// view specific post
exports.getpost=catchasync(async (req,res,next)=>{
                                                     // get claims reports of his posts 
    let flg=false
    if(req.user && req.user.posts)
    flg = req.user.posts.includes(req.params.id)?true:false;


    const post = flg?await Post.findById(req.params.id).populate('claims')
                                                       .populate('reports')
                    :await Post.findById(req.params.id).select('-claims -reports -__v');

    if(!post)
    return next(new AppError('No posts found belonging to user',404));

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

    const post = await Post.findOne({_id:req.params.id});

    if(post.claims.includes(req.user.id))
    return next(new AppError('You have already claimed the Post',400));

    post.claims.push(req.user.id);

    await post.save();

    if(!post)
    return next(new AppError('Cannot claim post',404));

    // console.log(post);

    req.post = post;

    // console.log(req.post);

    next();

});

exports.report = catchasync(async(req,res,next)=>{


    const access= req.user.canpost();
    if(access.access===false)
    return next(new AppError(access.message,204));

    const post = await Post.findOne({_id:req.params.id}).select('+reports');

    if(!post)
    return next(new AppError('No Such Post found',404));

    if(post.reports.includes(req.user.id))
    return next(new AppError('You have already reported the Post',400));

    post.reports.push(req.user.id);

    await post.save();

    // console.log(post);

    req.post = post;

    // console.log(req.post);

    next();

});


exports.didclaim = catchasync(async (req,res,next)=>{
    
    const post = await Post.findById(req.params.postid).select('+claims +reports');

    if(post.owner._id == req.user.id){
        req.body.id = req.user.id;
        return next();
    }
    if((post.claims.includes(req.user.id)||post.reports.includes(req.user.id))){
        
        req.body.id = post.owner._id;

        return next();
    }

    return next(new AppError('Cannot obtain details as post not claimed',204));
});