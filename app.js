const express = require('express');
const morgan = require('morgan');
const app =express();
const cookieParser = require('cookie-parser');

const postrouter = require('./routes/postrouter'); 
const userrouter = require('./routes/userrouter'); 

app.use(morgan('dev'));

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/posts',postrouter);

app.use('/api/v1/users',userrouter);


module.exports=app;