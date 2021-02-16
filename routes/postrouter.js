const express = require('express');
const postrouter=express.Router();
const fs = require('fs');
const Post = require('../models/postmodel');
const User = require('../models/usermodel');

const data=JSON.parse(fs.readFileSync(`${__dirname}/../tempdata/post.json`,'utf-8'));


postrouter.get('/',(req,res)=>{
    res.status(200).json({
        status:'success',
        data
    });
});


postrouter.post('/',async (req,res,next)=>{
    try{
        
        const post=await Post.create(req.body);
        
        req.body.postid=post._id;

        req.body.post=post;

        next();
    }
    catch(err){
        res.status(404).json({
            err
        });
    }
});

module.exports = postrouter;