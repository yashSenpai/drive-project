import mongoose,{ Schema } from "mongoose";

const tagSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    usedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

export const Tag = mongoose.model("Tag", tagSchema)