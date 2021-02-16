const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');



const userschema = new mongoose.Schema({
    profile:{
        firstname:{
            type:String,
            required:[true,'A name must have firstname/surname']
        },
        middlename:{
            type:String
        },
        lastname:{
            type:String
        },
        address:{
            city:{
                type:String,
            },
            pincode:{
                type:Number,
                validate:{
                    validator:function(el){
                        return el<1000000||el>=100000;
                    }
                }
            },
            fulladdress:{
                type:String
            }
        },
        displaypic:String,
    },
    mobilenum:{
        type:String,
        unique:true,
        validate:[validator.isMobilePhone,'Invalid mobile number provided check again']
    },
    email:{
        type:String,
        validate:[validator.isEmail,'Email Id is incorrect'],
        required:[true,'A user must have email id'],
        lowecase:true,
        unique:true
    },
    posts:[{
            type:mongoose.Schema.ObjectId,
            ref:'Post'
    }],
    violation:{
        banned:{
            type:Boolean,
            default:false
        },
        bantime:{
            type:Date
        },
        select:false
    },
    superuser:{
        type:Boolean,
        default:false,
        select:false
    },
    // password section
    password:{
        type:String,
        required:[true,'A user must have password'],
        minlength:8,
        select:false
    },
    passwordconf:{
        type:String,
        validate:{
            validator:function(el){
                return this.password===el;
            },
            message:'Passwords do not match check again'
        }
    },
    passwordchangedat:{
        type:Date
      },
      passwordresettoken:{
        type:String
      },
      passwordresetexpire:{
        type:Date
      }
    
});

// document middleware
userschema.pre('save',async function(next){
    // if password is modified then the password is hashed ex: // IDEA:
    // if user updates only email then this shouldnt run
    if(!this.isModified('password'))return next();
  
    this.password= await bcrypt.hash(this.password,12);
  
    this.passwordconf=undefined;
    next();
  });

  
userschema.pre('save',function(next){
    if(!this.isModified('password')|| this.isNew)return next();
    this.passwordchangedat=Date.now()-1000;
    next();
});


// query middleware
userschema.pre(/^find/,function(next){
    // populating posts on find user
    this.populate({path:'posts',select:'-__v'});
    next();
  });



// methods related to password

userschema.methods.correctpassword=async function(pass,orgpass){
    return await bcrypt.compare(pass,orgpass);
}

userschema.methods.canpost = async function(){
    if((this.violation.banned&&Date.now<this.violation.bantime))
    return {
        access:false,
        message:'The user is banned'
    };

    if(!this.mobilenum)
    return {
        access:false,
        message:'The user has not given mobile number'
    };

    return {
        access:true,
        message:'The user has not given mobile number'
    };
}

userschema.methods.changedpassword=function(jwttimestamp){
  if(this.passwordchangedat){
    const converted=parseInt(this.passwordchangedat.getTime()/1000);
    return  converted>jwttimestamp;
  }

  return  false;
}

userschema.methods.resettoken=function(){
  const token=crypto.randomBytes(32).toString('hex');

  // stroing into db securely so hash it
  this.passwordresettoken=crypto.createHash('sha256').update(token).digest('hex');
  //  20 minutes validation
  this.passwordresetexpire=Date.now()+20*60*1000;

  return token;
}


const User = mongoose.model('User',userschema);

module.exports = User;