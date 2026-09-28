import mongoose , {Schema, Types} from "mongoose";

export interface ILike {
    video: Types.ObjectId | null;
    comment: Types.ObjectId | null;
    tweet: Types.ObjectId | null;
    likedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const likeSchema = new Schema<ILike>({
    video : { type: Schema.Types.ObjectId, ref: "Video", default: null },
    comment : { type: Schema.Types.ObjectId, ref: "Comment"  , default: null },
    tweet : { type: Schema.Types.ObjectId, ref: "Tweet"  , default: null },
    likedBy : { type: Schema.Types.ObjectId, ref: "User", required: true },

}
, { timestamps: true } );

likeSchema.pre("validate", function (next) {
  const targets = [this.video, this.comment, this.tweet].filter(Boolean);

  if (targets.length === 0) {
    return next(new Error("Like must belong to a video, comment, or tweet"));
  }

  if (targets.length > 1) {
    return next(new Error("Like can belong to only one target"));
  }

  next();
});

export const Like = mongoose.model<ILike>("Like", likeSchema);
