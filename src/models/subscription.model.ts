import mongoose , {Schema, Types} from "mongoose";

export interface ISubscription {
    subscriber: Types.ObjectId;
    channel: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
    // one who will subscribe to a channel
    subscriber : { type : Schema.Types.ObjectId , ref : "User" , required : true },
    //one who is being subscribed to
    channel : { type : Schema.Types.ObjectId , ref : "User" , required : true },
} , { timestamps : true } ) ;

export const Subscription = mongoose.model<ISubscription>("Subscription" , subscriptionSchema) ;
