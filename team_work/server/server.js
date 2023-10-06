import dotenv from "dotenv";
import mongoose from "mongoose";

process.on('uncaughtException',err=>{
  console.log('UNCAUGHT EXCEPTION 🤯 : Shuting Down....')
  console.log(err.name,err.message) 
   process.exit(1)
    
})

dotenv.config({ path: './config.env' });
const app = require ("./index");

const DB = process.env.DATABASE;

mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }).then(()=> console.log(" Db connection done successfully"));


const port = process.env.PORT||8000;
const server = app.listen(port, () =>
  process.stdout.write(`Listening on port ${port} ...\n******************** \n`)
); 

process.on('unhandledRejection',err=>{
  console.log('UNHANDLED REJECTION 🤯 : Shuting Down....')
  console.log(err.name,err.message) 
  server.close(()=>{
       process.exit(1)
  }) 
})
 



