import mongoose ,{Schema, Types, AggregatePaginateModel} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IVideo {
    videoFile: string;
    thumbnail: string;
    title: string;
    description: string;
    duration?: number;
    views: number;
    likes: number;
    isPublished: boolean;
    dislikes: number;
    owner: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
    videoFile: { type: String, required: true }, //use cloudinary later}
    thumbnail: { type: String , required : true}, //use cloudinary later}
    title: { type: String, required: true },
    description: { type: String , required : true},
    duration: { type: Number, required: false }, // duration in seconds
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    dislikes: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

}, { timestamps: true });



videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model<IVideo, AggregatePaginateModel<IVideo>>("Video", videoSchema);

export {Video};
