import mongoose  , { Schema, Types} from "mongoose";

export interface IPlaylist {
    name: string;
    description?: string;
    videos: Types.Array<Types.ObjectId>;
    owner: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>({
    name : { type: String, required: true , trim: true },
    description : { type: String , trim: true },
    videos : [{ type: Schema.Types.ObjectId, ref: "Video" }],
    owner : { type: Schema.Types.ObjectId, ref: "User", required: true },

} ,
{timestamps : true});

export const Playlist = mongoose.model<IPlaylist>("Playlist", playlistSchema);
