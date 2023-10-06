
import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema({
    articleTitle:{
        type:String  
    },
    article:{
        type:String,
        maxlength:100
    },
    authorName:{
        type:String   
    },
    authorID:{
        type:String
    }
   
})

const Article = mongoose.model('Article',articleSchema);

export default Article;