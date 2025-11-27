import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    // one who will subscribe to a channel
    subscriber : { type : Schema.Types.ObjectId , ref : "User" , required : true },
    //one who is being subscribed to
    channel : { type : Schema.Types.ObjectId , ref : "User" , required : true },
} , { timestamps : true } ) ;   

export const Subscription = mongoose.model("Subscription" , subscriptionSchema) ; 
