import mongoose,{ Schema } from "mongoose";

const tagSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    usedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    file:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "File"
    },
    folder:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder"
    }
},{timestamps:true})

export const Tag = mongoose.model("Tag", tagSchema)