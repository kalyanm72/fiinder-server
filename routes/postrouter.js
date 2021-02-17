const express = require('express');
const postrouter=express.Router();
const authcontroller = require('../controllers/authcontroller');
const postscontroller = require('../controllers/postscontroller');
const usercontroller = require('../controllers/usercontroller');


postrouter.get('/',postscontroller.getallposts) //ok
          .post('/',authcontroller.protect,postscontroller.newpost,usercontroller.addnewpost); //ok

postrouter.get('/:id',postscontroller.getpost) //ok
            .patch('/:id',authcontroller.protect,postscontroller.updatepost) //ok
            .delete('/:id',authcontroller.protect,authcontroller.restrictto, postscontroller.deletepost); //ok

postrouter.patch('/:id/claim',postscontroller.claim,usercontroller.addclaims);
postrouter.patch('/:id/report',postscontroller.report,usercontroller.addreport);

postrouter.get('/:id/ownerdetails',postscontroller.didclaim, usercontroller.getuserid);



module.exports = postrouter;