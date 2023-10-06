import validator from 'validator'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'


const userSchema = new mongoose.Schema({

    firstName:{
        type:String,
        required:[true,'Your firstName Please'],
        
    },
    lastName:{
        type:String,
        required:[true,'Your lastName Please']
    },
    email:{
        type:String,
        required:[true,'Your email please'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,' Provide Valid email Please']
    },
    role:{
      type:String,
      enum:['user','admin','super-admin','ownerID'],
      default: 'user'
    },
   password:{
   type:String,
   required:[true,'password is required'],
   minlength:8,
   select:false
      
   },
   confirmPassword:{
    type:String,
    required:[true,'please confirm your password'],

    validate:{
     validator:function(el){
         return el === this.password
     },
     message:'password not matching'
    }  
   },
   gender:{
       type:String,
       required:[true,'gender Please!']
   },
   jobRole:{
    type:String,
    required:[true,'Your Role Please!']
   },
   department:{
       type:String,
       required:[true,'Your Department Please!']
   },
   address:{
       type:String,
       required:[true,'Your Address Please!']
   },
   passwordChangedAt:Date,
   passwordResetToken:String,
   passwordResetTokenEpires:Date,
   active:{
       type:Boolean,
       default:true,
       select:false
   }

   })

   userSchema.pre('save', async function(next){

    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password,12);
    this.confirmPassword = undefined;

    next();
})

 userSchema.pre('save',function(next){
     if(!this.isModified('password')|| this.isNew) return next();

     this.passwordChangedAt = Date.now() - 1000;

     next()
 })

 userSchema.pre(/^find/,function(next){
// this point to the current querry
this.find({active:{$ne:false}})  // no equal to false

next();

 })

userSchema.methods.checkPassword = async function(currentPassword,userPasword){

    return await bcrypt.compare(currentPassword,userPasword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
if(this.passwordChangedAt){

    const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10)
    console.log(changedTimestamp,JWTTimestamp)
    return JWTTimestamp < changedTimestamp; // 100 < 200 :300<200
}
// False means password not changed
    return false;
}


userSchema.methods.createPasswordResetToken = function(){

 const resetToken = crypto.randomBytes(32).toString('hex');

 this.passwordResetToken= crypto.createHash('sha256').update(resetToken).digest('hex');

 //console.log({resetToken},this.passwordResetToken)

 this.passwordResetTokenEpires = Date.now() + 10 * 60 * 1000;
 
 return resetToken;
}
const User = mongoose.model('User',userSchema);

export default User;