const express = require('express');
const postrouter=express.Router();
const authcontroller = require('../controllers/authcontroller');
const postscontroller = require('../controllers/postscontroller');
const usercontroller = require('../controllers/usercontroller');


postrouter.get('/',postscontroller.getallposts) //ok
          .post('/',authcontroller.protect,postscontroller.uploadPostimage,postscontroller.resizePhoto,
                     postscontroller.newpost,usercontroller.addnewpost); //ok


                      
postrouter.route('/myposts').get(authcontroller.protect, postscontroller.getmyposts,postscontroller.getpost);

postrouter.get('/:id',authcontroller.softprotect, postscontroller.getpost) //ok
            .patch('/:id',authcontroller.protect,postscontroller.uploadPostimage,postscontroller.resizePhoto, postscontroller.updatepost) //ok
            .delete('/:id',authcontroller.protect,authcontroller.restrictto, postscontroller.deletepost); //ok


// postrouter.get('/myposts',authcontroller.protect,postscontroller.getmyposts,postscontroller.getpost);

postrouter.patch('/:id/claim',authcontroller.protect,postscontroller.claim,usercontroller.addclaims); //ok
postrouter.patch('/:id/report',authcontroller.protect,postscontroller.report,usercontroller.addreport); //ok

postrouter.get('/:postid/ownerdetails',authcontroller.protect,postscontroller.didclaim, usercontroller.getuserid);



module.exports = postrouter;