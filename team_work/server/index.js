import express from "express";
import bodyParser from "body-parser";
import compression from "compression"
import userRouter from "./routes/userRoutes"
import commentRouter from './routes/commentRoutes'
import articleRouter from './routes/articleRoutes'
import AppError from './utils/appError';
import * as globalErrorHandler from './controllers/errorController'
import rateLimit from 'express-rate-limit'
import helmet  from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'

const app = express();

// set security HTTP Headers
app.use(helmet());

//Limit request from same API

const limiter = rateLimit({
 max:100,
 windowMs: 60 * 60 * 1000,
 message: 'Too many requests from this IP , Please try agmain afer an hour'
});

app.use('/api',limiter);

// Body parser , reading data from the body into body req.body
app.use(express.json({limit: '10kb'}));

// Data Sanitization against NoSQL Query Injection
   app.use(mongoSanitize())
// Data sanitization Against XSS( Cross -site scripting attacks)
   app.use(xss())

// Prevent paramter pollution
   app.use(hpp())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// compressor
app.use(compression())


app.get('/', (req,res)=>{res.status(200).send({
    status:200,
    message:'welcome to teanwork',
})})


app.use("/api/v1/users",userRouter);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/comments",commentRouter);

app.all('*',(req,res,next)=>{

next(new AppError(`can't find ${req.originalUrl} on this server`,404)) 
})
 
app.use(globalErrorHandler.errorHandler);
module.exports = app;
