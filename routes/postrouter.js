const express = require('express');
const postrouter=express.Router();
const authcontroller = require('../controllers/authcontroller');
const postscontroller = require('../controllers/postscontroller');
const usercontroller = require('../controllers/usercontroller');


postrouter.get('/',postscontroller.getallposts)
          .post('/',authcontroller.protect,postscontroller.newpost,usercontroller.addnewpost);

postrouter.get('/:id',postscontroller.getpost)
            .patch(':/id',authcontroller.protect,postscontroller.updatepost)
            .delete(':/id',authcontroller.protect,postscontroller.deletepost);



module.exports = postrouter;