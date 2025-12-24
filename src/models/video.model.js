import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: { type: String, required: true }, //use cloudinary later}
    thumbnail: { type: String , required : true}, //use cloudinary later}
    title: { type: String, required: true },
    description: { type: String , required : true},
    duration: { type: Number, required: false }, // duration in seconds
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    dislikes: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
}, { timestamps: true });

 
 
videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model("Video", videoSchema);

export {Video};