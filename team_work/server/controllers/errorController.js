import AppError from "../utils/appError"

 const handleCastErrorDB = err=>{

  const message = `Invalid ${err.path}: ${err.value}` 
  return new AppError(message,400);
}

const handleDulplicateFiledsDB = err=>{
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
 // console.log(value)
  const message = `Duplicate field value :${value} please correct it`
  return new AppError(message,400)
}

 const handleValidationErrorDB = err=>{
 const errors = Object.values(err.errors).map(el=>el.message)
       // console.log(errors)
 const message =`Invalid input data: ${errors.join('. ')}`;
 return new AppError(message,400)
 }

 const handleJsonWebTonError = ()=>{
  return new AppError('Invalid token, please logon again!',401)
 }

 const handleJwtEpiredError =()=>{
  return new AppError('Your Token has expired please login again!')
 }
 const sendErrorDev = (err,res)=>{

  res.status(err.statusCode).json({

    status:err.status,
    err:err,
    message:err.message,
    stack:err.stack
  
  })
 }
 const sendErrorProd = (err,res)=>{
// Operational error we trust , send the error to the client
  if(err.isOperational)
  {
    res.status(err.statusCode).json({
    status:err.status,
    message:err.message,  
 })

 // Programming or other uknown errors , don't ever leack details to the  client

  }else{
    //1) Log error

 console.error('ERROR 🔥',err)

 //2) Send a generic message to the client

 res.status(500).json({
  status:'error',
  message:'Some thing went very wrong!'
})
  }
 }

 export const errorHandler = (err,req,res,next)=>{
  //console.log(err.stack)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error'

if(process.env.NODE_ENV === 'development'){
  console.log(process.env.NODE_ENV)
 sendErrorDev(err,res);
 
}else if(process.env.NODE_ENV === 'production'){

  let error = err;

 // console.log(error.name)
  //console.log(process.env.NODE_ENV)
  if(error.name === 'CastError') error = handleCastErrorDB(error)
  if(error.code === 11000) error =handleDulplicateFiledsDB(error)
  if(error.name === 'ValidationError') error = handleValidationErrorDB(error)
  if(error.name ==='jsonWebTokenError') error = handleJsonWebTonError()
  if(error.name ==='TokenEpiredError') error = handleJwtEpiredError()

  sendErrorProd(error,res);
}
  
}