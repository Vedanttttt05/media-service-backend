import mongoose ,{Schema, Types, AggregatePaginateModel, HydratedDocument} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface IComment {
    content: string;
    video: Types.ObjectId;
    owner: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type CommentDocument = HydratedDocument<IComment>;

const commentSchema = new Schema<IComment>(
    {
        content : { type: String, required: true , trim: true },
        video : { type: Schema.Types.ObjectId, ref: "Video", required: true },
        owner : { type: Schema.Types.ObjectId, ref: "User", required: true },
    }
    , { timestamps: true });

commentSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model<IComment, AggregatePaginateModel<IComment>>("Comment", commentSchema);
