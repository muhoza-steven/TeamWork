import User from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

const filerObj =(obj, ...allowedFilds)=>{
    const newObj = {};

    Object.keys(obj).forEach(el=>{
        if(allowedFilds.includes(el)) newObj[el] = obj[el]
    })

    return newObj
} 

export const createUser = catchAsync(async (req,res,next)=>{

    const newUser = await User.create({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        gender:req.body.gender,
        jobRole:req.body.jobRole,
        department:req.body.department,
        address:req.body.address
    });
    res.status(201).json({
        status:'success',
        data:{
            newUser
        }
    })
})


export const getAllUsers = catchAsync(async (req,res,next)=>{

    const users = await User.find();

    res.status(200).json({
      status:'success',
      data:{
        users
      }
    })
})

export const updateMe = catchAsync( async (req,res,next)=>{
//1) Create error if user trying to update password data
if(req.body.password || req.body.confirmPassword){
    return next( new AppError('This route is not for password updates. please use /updatePassword',400))
}

//2 update user document
// filered out elements that are not allowed to be updated
const filteredBody = filerObj(req.body,'firstName','lastName','email')

//3 update current user data 

const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
    new:true,
    runValidators:true
})

res.status(200).json({
    status:'success',
    user:updatedUser
})

});

export const deleteMe = catchAsync( async (req,res,next)=>{

  await User.findByIdAndUpdate(req.user.id,{active:false})

  res.status(204).json({
      status:"success",
      data:null
  })  
})

export const getUser = catchAsync(async (req,res,next)=>{

  const user = await User.findById(req.params.id)

    res.status(200).json({
        status:'success',
        data:{
            user
        }
      })
})


export const deleteUser =  catchAsync(async (req,res,next)=>{

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        message:"Deleted successfully",
        data:{
            
        }
      })
})

export const updateUser = catchAsync(async (req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.params.id,req.body,{
        new :true,
        runValidators:true
    }
    )

    res.status(200).json({
        status:'success',
        data:{
            user
        }
      })
})