const express = require('express');
const userrouter = express.Router();
const User = require('../models/usermodel');
const authcontroller = require('../controllers/authcontroller');
const usercontroller = require('../controllers/usercontroller');


userrouter.post('/signup',authcontroller.signup); // ok
userrouter.post('/login',authcontroller.login); //ok 

// should be logged in before
userrouter.use(authcontroller.protect); //ok

userrouter.patch('/updateprofile',usercontroller.updateprofile); //ok


// only for super users
userrouter.use(authcontroller.restrictto); 

userrouter.route('/').post(usercontroller.createuser).get(usercontroller.getallusers); //ok
userrouter.route('/:id').get(usercontroller.getuserid); //ok

userrouter.route('/:id/ban').patch(usercontroller.banuser); //ok
userrouter.route('/:id/unban').patch(usercontroller.unbanuser); //ok


module.exports = userrouter;