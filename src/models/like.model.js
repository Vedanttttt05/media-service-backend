import mongoose , {Schema} from "mongoose";

const likeSchema = new Schema({
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

export const Like = mongoose.model("Like", likeSchema);