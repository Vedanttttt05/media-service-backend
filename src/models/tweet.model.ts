import mongoose , {Schema, Types, HydratedDocument}from "mongoose";

export interface ITweet {
    content: string;
    owner: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type TweetDocument = HydratedDocument<ITweet>;

const tweetSchema = new Schema<ITweet>({
    content : { type: String, required: true , trim: true },
    owner : { type: Schema.Types.ObjectId, ref: "User", required: true },

} , { timestamps: true } );

export const Tweet = mongoose.model<ITweet>("Tweet", tweetSchema);
