
import mongoose from "mongoose"
import {Video} from "../models/video.model"
import {Subscription} from "../models/subscription.model"
import {Like} from "../models/like.model"
import ApiError from "../utils/apiError"
import ApiResponse from "../utils/apiResponse"
import {asyncHandler} from "../utils/asyncHandler"

const getChannelStats = asyncHandler(async (req, res) => {
     const userId = req.user!._id

    const totalVideos = await Video.countDocuments({ owner: userId });

    const viewsAgg = await Video.aggregate([
        { $match: { owner :  new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    const totalViews = viewsAgg.length > 0 ? viewsAgg[0].totalViews : 0;

    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    const videoIds = await Video.find({ owner: userId }).select("_id");

    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds.map(v => v._id) }
    });

        const stats = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    };
    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));



    
})


const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user!._id;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});


export {
    getChannelStats, 
    getChannelVideos
    }
