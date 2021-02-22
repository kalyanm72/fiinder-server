const AppError = require('../utils/apperror');

const sendeverror=(err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        stack:err.stack,
        error:err
    });
}

const sendproderror=(err,res)=>{
    if(err.isOperational===true){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        });
    }
    else{
        
        console.log('Error Occured in app: ',err);
        res.status(500).json({
            status:'error',
            message:'something went wrong'
        });

    }
}




const Validation=err=>{
    const errors=Object.values(err.errors).map(el=>el.message);
    const message=`invalid input: ${errors}`;
    return  new AppError(message,400);
  }
  const handlecasterror=err=>{
      const message=`invalid ${err.path}: ${err.value}`;
      return new AppError(message,400);
  };
  
  const handleDuplicate=err=>{
    let message;
    if(err.keyValue.email)
     message=`email: ${err.keyValue.email} is already registered`;
    else if(err.keyValue.rollno)
     message=`RollNo: ${err.keyValue.rollno} is already registered`;
    else
     message=`Some duplicate error`;

    return new AppError(message,400);
  }


const jsonwebtokenerr=()=> new AppError('Invalid login please try again',401);
const jwttokenexpirerr=()=> new AppError('Token has expired login again',401);

module.exports=(err,req,res,next)=>{
    
    err.statusCode=err.statusCode||500;
    err.status=err.status||'error';

    
    
    if(process.env.NODE_ENV==='development'){
        sendeverror(err,res);
    }
    else{
       
        // use this only for specific type of errors as message will not be destructured
        let error={...err};
        
        if(error.path){
            error=handlecasterror(error);
            return sendproderror(error,res);
          }
          if(error.code===11000){
            error=handleDuplicate(error);
            return sendproderror(error,res);
          }
          if(error._message==='Post validation failed'||error._message==='Validation failed'){

              error=Validation(error);
              return sendproderror(error,res);
          }
          if(error.name==='JsonWebTokenError'){
            error=jsonwebtokenerr();
            return sendproderror(error,res);
          }
          if(error.name==='TokenExpiredError'){
            error=jwttokenexpirerr();
            return sendproderror(error,res);
          }
        
        sendproderror(err,res);
    }
}