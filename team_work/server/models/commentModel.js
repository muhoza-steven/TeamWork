import mongoose from 'mongoose'

 const commentSchemma = new mongoose.Schema({

    articleTitle:{
        type:String
    },
    article:{
        type:String
    },
    comment:{
       type:String
    },
    articleID:{
        type:String,
        
    }
})

// comments:{
    //     type:[mongoose.Schema.Types.Mixed]
    // },
commentSchemma.methods.Deletecomment = async function(el,next){
if(this.articleID===el){
    this.articleID = undefined
}
next()
}
const Comment = mongoose.model('Comment',commentSchemma);

export default Comment
