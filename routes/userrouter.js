const express = require('express');
const userrouter = express.Router();
const authcontroller = require('../controllers/authcontroller');
const usercontroller = require('../controllers/usercontroller');


userrouter.post('/signup',authcontroller.signup); // ok
userrouter.post('/login',authcontroller.login); //ok 
userrouter.post('/logout',authcontroller.logout);
userrouter.post('/loggedin',authcontroller.isLoggedIn);


userrouter.post('/forgotpassword/:email',authcontroller.forgotpassword);
userrouter.patch('/resetpassword/:token',authcontroller.resetpassword);


// should be logged in before
userrouter.use(authcontroller.protect); //ok

userrouter.patch('/updateprofile',usercontroller.uploadUserimage,usercontroller.resizePhoto, usercontroller.updateprofile); //ok
userrouter.route('/me').get(usercontroller.getme,usercontroller.getuserid);

userrouter.patch('/updatepassword',authcontroller.updatepassword);

userrouter.route('/:id').get(authcontroller.restrictto,usercontroller.getuserid); //ok



// not usefull instead user can search for all posts which he is owner and can populate respectively
// userrouter.route('/getmyposts').get(usercontroller.getuserposts);


// only for super users
userrouter.use(authcontroller.restrictto); 

userrouter.route('/').post(usercontroller.createuser).get(usercontroller.getallusers); //ok


userrouter.route('/:id/ban').patch(usercontroller.banuser); //ok
userrouter.route('/:id/unban').patch(usercontroller.unbanuser); //ok


module.exports = userrouter;