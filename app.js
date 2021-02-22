const express = require('express');
const morgan = require('morgan');
const app =express();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const ratelimit = require('express-rate-limit');
const mongosanitize = require('express-mongo-sanitize');
const AppError = require('./utils/apperror');
const postrouter = require('./routes/postrouter'); 
const userrouter = require('./routes/userrouter'); 

const errorcontroller = require('./controllers/errorcontroller');

app.use(helmet());

if(process.env.NODE_ENV==='development')
app.use(morgan('dev'));

const limiter=ratelimit({
    windowMs:60*60*60,
    max:1000,
    message:'Too many requests please try later'
});

app.use('/api',limiter);
app.use(express.json({limit:'1mb'}));

app.use(mongosanitize());
app.use(xss());

app.use(cookieParser());


// app.use(hpp({whitelist:[]}));


app.use('/api/v1/posts',postrouter);

app.use('/api/v1/users',userrouter);

app.all('*',(req,res,next)=>{

    next(new AppError(`Route not defined yet for ${req.originalUrl}`,404));

});

app.use(errorcontroller);

module.exports=app;