import mongoose, { Schema } from "mongoose";

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
  }
})

export const User = mongoose.model("User", userSchema)