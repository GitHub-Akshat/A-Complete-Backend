import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: true
    },
    deccription: {
        type: String,
        required: true
    },
    duration: {
        type: Number, 
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    ispublished: {
        type: Boolean,
        requierd: true
    }
}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate);   // Aggregation pipeline starting 

export const Video = mongoose.model("Video", videoSchema);