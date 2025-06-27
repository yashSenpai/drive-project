import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { jwt } from "jsonwebtoken";

const userSchema = new Schema({
  username:{
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trix: true
  },
  email:{
    type:String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
    },
  fullname:{
    type:String,
    required: true,
    trim: true,
    index: true
    },
  password:{
        type:String,
        required:[true,'Password is required.']
  },
  refreshToken:{
        type: String
  },
  storageUsed:{
    type: Number,
    default: 0
  },
  storageLimit:{
    type: Number,
    default: 20971520 //limit is 20 megabytes
  }
},{timestamps:true})

userSchema.pre("save",async function(next){
  if(!this.isModified("password")){
    return next
  }else{
    this.password = await bcrypt.hash(this.password, 10)
  }
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id:this._id,
      email:this.email,
      fullname:this.fullname,
      username:this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema)