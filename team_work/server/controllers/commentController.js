
import Comment from '../models/commentModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError'
import Article from '../models/articleModel'

export const createComment = catchAsync(async (req,res,next)=>{
  const myArticle = await Article.findById(req.params.id)
  const comment = await Comment.create({

    articleTitle:myArticle.articleTitle,
    article:myArticle. article,
    comment: req.body.comment,
    articleID:req.params.id,
  });
 

  req.requestTime  =new Date().toISOString();

  res.status(201).json({
      status:'success',
      message : "Commented Successfully",
      data:{
      createdOn:req.requestTime,
        comment
      }
  })
})
 
export const getAllComment = catchAsync(async (req,res,next)=>{

  req.requestTime  =new Date().toISOString();
  
  const comments = await Comment.find();

  res.status(200).json({
    status:'success',
    data:{
        comments
    }
  })
})

export const getComment = catchAsync(async (req,res,next)=>{
  
 
  const comment = await Comment.findById(req.params.id)

  if(!comment){
    return next(new AppError('No Comment found with that ID',404))
  }

  res.status(200).json({
      status:'success',
      data:{
          comment
      }
    })
})


export const deleteComment =  catchAsync(async (req,res,next)=>{

 const comment = await Comment.findByIdAndDelete(req.params.id)

 if(!comment){
  return next(new AppError('No Comment found with that ID',404))
}

  res.status(204).json({
      status:'success',
      data:{
       
      }
    })
})

export const updateComment = catchAsync(async (req,res,next)=>{

  const comment = await Comment.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
  })

  if(!comment){
    return next(new AppError('No Comment found with that ID',404))
  }

  //console.log(comment)
  res.status(200).json({
      status:'success',
      data:{
        comment
      }
    })
})