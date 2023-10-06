import User from '../models/userModel';
import {promisify} from 'util'
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError'
import jwt from 'jsonwebtoken'
import sendEmail from '../utils/email'
import crypto from 'crypto'
import Article from '../models/articleModel'


const signToken = id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

const creatSentToken = (user,statusCode,res)=>{

    const token = signToken(user._id);

   const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //secure:true,
    httpOnly:true
}
    if(process.env.NODE_ENV === 'production') cookieOptions.secure =true
    res.cookie('jwt',token, cookieOptions)
     //removing password from result
     user.password = undefined

    res.status(statusCode).json({
        status:'success',
        message:'User created successfully',
        token,
        data:{
            user 
        }
    })
}

export const signUp = catchAsync(async (req,res,next)=>{

    //const employee = await Employee.create(req.body);
    const user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email:req.body.email,
        role:req.body.role,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        gender:req.body.gender,
        jobRole:req.body.gender,
        department:req.body.gender,
        address:req.body.address,
        passwordChangedAt:req.body.passwordChangedAt
    });

    creatSentToken(user,201,res)
    
})

export const login = catchAsync(async(req,res,next)=>{

    const {email,password} = req.body
   
    if(!email || !password){

    return next(new AppError("Please provide an email and password",400));
    }

    const user = await User.findOne({email}).select('+password');

    //const correctPass = await User.checkPassword(password,User.password)

    if(!user || !(await user.checkPassword(password,user.password)))
    {
        return next(new AppError("Invaild email or password",401));
    }
    //console.log(user);

    creatSentToken(user,200,res)
    
})

export const protect = catchAsync( async (req,res,next)=>{
    //1) get user based on token
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){

        token = req.headers.authorization.split(' ')[1];

    }
   // console.log(token);

    if(!token){
     return next(new AppError('You are not loged in ! please login to get access',401))
    }
     
    //2) verification token

    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
   // console.log(decoded)

    //3) check if user still exists
   const currentUser = await User.findById(decoded.id)

   if(!currentUser){
       return next(new AppError('The user with that token does not exist',401))
   }

   //4) check if user changed password after the token was generated
    
  if(currentUser.changedPasswordAfter(decoded.iat)){
   return next( new AppError('user recently changed password, Please login again!',401))
  }

  // Grant access to proted routes
  
  req.user = currentUser;
    next();
});


export const restrictTo =  (...roles)=>{

return async (req,res,next)=>{

    const userArticle = await Article.findById(req.params.id)
    // roles is an array :['admin','super-admin']

    if(!(roles.includes(req.user.role )||(req.user.id === userArticle.authorID ))){
        //403 :forbidden
        return next(new AppError('You are not permited to perform this action',403));
    }
    next();
}
}

export const forgotPassword = catchAsync(async(req,res,next)=>{

    //1) Get user based on posted email
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError('There is no user with that email address',404));

    }
    //2) Generate random reset token
     const resetToken = user.createPasswordResetToken()
     await user.save({validateBeforeSave:false})
     //3)Send it to user's email
     const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

     const message = `Forgot your password! please submit a PATCH request with your new password and confirmPassword to:${resetURL}.\n If you didn't forget your password please ignore this email.`;

     //3) send email
     try{
        await sendEmail({
            email: user.email,
            subject:'Your password Reset Token (valid for 10 min )',
            message
     
          })
          res.status(200).json({
             status:'sucess',
             message:'Token sent to email'
         })
     
     }catch(err){
    
             user.passwordResetToken = undefined
             user.passwordResetTokenEpires = undefined
            await user.save({validateBeforeSave:false})
          return next(new AppError('Error while sending the email please try again after some times',500))
     }
  
         
})

export const resetPassword = catchAsync( async (req,res,next)=>{
    //1) Get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken:hashedToken,passwordResetTokenEpires:{$gt:Date.now()}})
    
    //2) if the token has not expired , and there is a user , set new password
     
    if(!user){
        return next(new AppError('Token i invalid or has epired',400));
    }

    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    user.passwordResetToken = undefined
    user.passwordResetTokenEpires = undefined
    await user.save()
    
    //3) update changePasswordAt propert for the user

    //4) log the user in , send JWT

    creatSentToken(user,200,res)
   

})

export const updatePassword = catchAsync(async (req,res,next)=>{

//1) Get the user from the collection
    const user = await User.findById(req.user.id).select('+password')
    
    if(!user){
        return next(new AppError('Please Login to perform this action',401));
    }
//2) Check if the provided current Password is correct
   if(!( await user.checkPassword(req.body.currentPassword,user.password))){
       return next(new AppError('Invalid current password ,Please try again',401));
   }

//3) set password updated

    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    await user.save()

//4) Login user with the new password , send JWT
creatSentToken(user,200,res)

})