const express = require('express');
const userrouter = express.Router();
const User = require('../models/usermodel');
const authcontroller = require('../controllers/authcontroller');
const usercontroller = require('../controllers/usercontroller');


userrouter.post('/signup',authcontroller.signup);
userrouter.post('/login',authcontroller.login);

// should be logged in before
userrouter.use(authcontroller.protect);

userrouter.patch('/updateprofile',usercontroller.updateprofile);
userrouter.patch('/newpost',usercontroller.addnewpost);


// only for super users
userrouter.use(authcontroller.restrictto);

userrouter.route('/').post(usercontroller.createuser).get(usercontroller.getallusers);

userrouter.route('/banuser/:id').patch(usercontroller.banuser);
userrouter.route('/unbanuser/:id').patch(usercontroller.unbanuser);


module.exports = userrouter;