const dotenv = require('dotenv');
const mongoose =require('mongoose');
dotenv.config({path:'./config.env'});

const db=process.env.MONGODB_URL.replace('<password>',process.env.MONGODB_PASS);

mongoose.connect(db,{
  useCreateIndex:true,
  useNewUrlParser:true,
  useFindAndModify:false
}).then(()=>console.log('connected to MongoDb'));

const express = require('express');
const app = require('./app');

const port=3000||process.env.PORT;

const server= app.listen(port,console.log('Server is running'));


