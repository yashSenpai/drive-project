import mongoose, { Schema } from "mongoose";

const folderSchema = new Schema({
  name:{
    type: String,
    required: true
},
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},
  parent:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null
}, // for nested folders
  path: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder"
}], // full path
},{timestamps:true})

export const Folder = mongoose.model("Folder", folderSchema)