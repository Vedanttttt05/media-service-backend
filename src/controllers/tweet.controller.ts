import mongoose, { isValidObjectId } from "mongoose"
import {Tweet, TweetDocument} from "../models/tweet.model"
import {User} from "../models/user.model"
import ApiError from "../utils/apiError"
import ApiResponse  from "../utils/apiResponse"
import {asyncHandler} from "../utils/asyncHandler"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const userId = req.user!._id

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    const tweet = await Tweet.create({
        content,
        owner: userId
    });
    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"));


})

const getUserTweets = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const userId = req.params.userId as string

    if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
}
const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
    
return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));

})


const updateTweet = asyncHandler(async (req, res) => {

    const { content } = req.body;
    const tweet = req.resource as TweetDocument;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "tweet content cannot be empty");
    }

    tweet.content = content;
    await tweet.save();

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweet = req.resource as TweetDocument;
    const  check = await tweet.deleteOne();
    if (!check) {
        throw new ApiError(500, "Failed to delete tweet");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Tweet deleted successfully"));

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}