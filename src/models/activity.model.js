import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    action:{
        type: String,
        enum:[
            'upload',
            'download',
            'delete',
            'move',
            'rename'
        ],
        required: true
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

export const Activity = mongoose.model("Activity", activitySchema)