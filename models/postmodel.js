const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const validator = require('validator');
const User = require('./usermodel');


const postschema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A post requires a name'],
        minlength:[5,'A post must have atleast 5 letters length'],
        trim:true
    },
    slug:String,
    Description:{
        type:String,
        trim:true
    },
    images:{
        type:[String],
    },
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    lost:{
        type:Boolean,
        default:false
    },
    found:{
        type:Boolean,
        default:false,
            validate:{
                validator:function(el){
                    if(el===this.lost)
                    return 0;
                    return 1;
                },
                message:'A post can be only either found or lost'
        }
    },
    active:{
        type:Boolean,
        select:false,
        default:true
    },
    location:{
        // geoJSON firsts longitude then lattitude
        type:{
            type:String,
            default:'Point',
            enum:['Point']
          },
          coordinates:[Number],
          address:String,
          description:String,
          alias:String
    },
    primarycolour:String,
    secondarycolour:String,
    dateidentified:Date,
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    claims:[{type:mongoose.Schema.ObjectId,
        ref:'User',select:false}],
    reports:[{type:mongoose.Schema.ObjectId,
        ref:'User',select:false}]

});

// document middlewares

postschema.pre(/^find/,function(next){
    this.find({active:{$ne:false}});
    this.populate({path:'owner',select:'-__v -mobilenum -posts -passworchangedat -violation'});
    next();
});


postschema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true});
    next();
});


const Post = mongoose.model('Post',postschema);

module.exports = Post;

