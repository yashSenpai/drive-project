import mongoose,{ Schema } from "mongoose";

const fileSchema = new Schema({
    name:{
        type: String,
        required: true
    },
     type:{
        type: String,
        enum:[
            'image',
            'video',
            'document'
        ],
        required: true
    },
    size:{
        type: Number,
        required: true
    }, // in bytes
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    folder:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: null
    },
    url:{
        type: String,
        required: true
    }, // actual file location in cloud
    tags: [{
        type: String,
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag"
    }]
})

export const File = mongoose.model("File", fileSchema)