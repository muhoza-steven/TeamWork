import Article from '../models/articleModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import Comment from '../models/commentModel'


export const createArticle = catchAsync(async (req,res,next)=>{

  const newArticle = await Article.create({
    
    articleTitle : req.body.articleTitle,
    article: req.body.article,
    authorName : req.body.authorName,
    authorID : req.user.id,
    
  });

  res.status(201).json({
      status:'success',
      data:{
          newArticle
      }
  })
})
 

export const getAllArticles = catchAsync(async (req,res,next)=>{

  const articles = await Article.find();

  res.status(200).json({
    status:'success',
    data:{
      articles
    }
  })
})



export const getArticle = catchAsync(async (req,res,next)=>{

  const comments = await Comment.find({articleID:req.params.id})
  const article = await Article.findById(req.params.id).select('+comments')

if(!article){
  return next(new AppError('No Article found with that ID',404))
}

  res.status(200).json({
      status:'success',
      data:{
          article,
          comments
      } 
     
    })
})

export const deleteArticle =  catchAsync(async (req,res,next)=>{
  const comments = await Comment.deleteMany({articleID:req.params.id})
  const article = await Article.findByIdAndDelete(req.params.id)

  if(!article){
    return next(new AppError('No Article found with that ID',404))
  }

  res.status(204).json({
      status:'success',
      data:{},
      comments
    })
})

export const updateArticle = catchAsync(async (req,res,next)=>{

    const article=await Article.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidator:true
    })

    if(!article){
      return next(new AppError('No Article found with that ID',404))
    }

    res.status(200).json({
        success:true,
        data: article
    })

})

