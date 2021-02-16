
class AppError extends Error{
    constructor(message,statuscode){
        super(message);
        this.statuscode=statuscode
        this.staus=`${statuscode}`.startsWith('4')?'fail':'Error',
        
        Error.captureStackTrace(this,this.constructor);
    }

}


module.exports=AppError;