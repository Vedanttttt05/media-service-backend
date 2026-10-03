import mongoose, {isValidObjectId, FilterQuery} from "mongoose"
import {Video, IVideo} from "../models/video.model"
import {User} from "../models/user.model"
import ApiError from "../utils/apiError"
import ApiResponse from "../utils/apiResponse"
import {asyncHandler} from "../utils/asyncHandler"
import {uploadToCloudinary} from "../utils/cloudinary"
import { VideoFiles } from "../types/files/video.files"
import { Like } from "../models/like.model";


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy,
        sortType,
        userId
    } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(Number(limit), 1);

    const sortField =
        typeof sortBy === "string" && sortBy
            ? sortBy
            : "createdAt";

    const sortOrder = sortType === "asc" ? 1 : -1;

    const filter: FilterQuery<IVideo> = {
        isPublished: true
    };

    if (typeof query === "string" && query) {
        filter.title = {
            $regex: query,
            $options: "i"
        };
    }

    if (typeof userId === "string" && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const videos = await Video.find(filter)
        .populate("owner", "username avatar")
        .sort({ [sortField]: sortOrder })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);

    const videosWithLikes = await Promise.all(
        videos.map(async (video) => {
            const likes = await Like.countDocuments({
                video: video._id
            });

            return {
                ...video.toObject(),
                likes
            };
        })
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            videosWithLikes,
            "Videos fetched successfully"
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body ?? {}

    if (!title || title.trim() === "") {
        throw new ApiError(400, "Video title is required")
    }
    const files = req.files as VideoFiles | undefined
    const videoLocalPath = files?.videoFile?.[0]?.path
     const thumbnailLocalPath = files?.thumbnail?.[0]?.path

     if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail are required")
    }

        const videoUpload = await uploadToCloudinary(videoLocalPath)
        const thumbnailUpload = await uploadToCloudinary(thumbnailLocalPath)

        if (!videoUpload || !thumbnailUpload) {
            throw new ApiError(500, "Failed to upload video or thumbnail")
        }
    const newVideo = await Video.create({
        title: title,
        description: description || "",
        videoFile: videoUpload.secure_url,
        thumbnail: thumbnailUpload.secure_url,
        duration: videoUpload.duration,
        owner: req.user!._id,
        isPublished: true,
        views : 0

    })

    return res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
        .populate("owner", "username avatar")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (
        !video.isPublished &&
        video.owner._id.toString() !== req.user?._id?.toString()
    ) {
        throw new ApiError(403, "This video is not published")
    }

    const likes = await Like.countDocuments({
        video: video._id
    })

    // count the view and move the video to the front of the viewer's watch history
    await Video.updateOne({ _id: video._id }, { $inc: { views: 1 } })
    await User.updateOne({ _id: req.user!._id }, { $pull: { watchHistory: video._id } })
    await User.updateOne(
        { _id: req.user!._id },
        { $push: { watchHistory: { $each: [video._id], $position: 0 } } }
    )

    const isLiked = Boolean(
        await Like.exists({ video: video._id, likedBy: req.user!._id })
    )

    const videoData = {
        ...video.toObject(),
        views: video.views + 1,
        likes,
        isLiked
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            videoData,
            "Video fetched successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description  , thumbnail} = req.body ?? {}

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const thumbnailLocalPath = req.file?.path

    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "At least one field is required (title, description, or thumbnail)")
    }

    const video = await Video.findById(videoId)

    
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    if (thumbnailLocalPath) {
        const thumbnail = await uploadToCloudinary(thumbnailLocalPath)
        if (!thumbnail?.url) {
            throw new ApiError(500, "Failed to upload thumbnail")
        }
        video.thumbnail = thumbnail.url
        
    }

    if (title) {
        video.title = title
    }
    if (description) {
        video.description = description
    }
    await video.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    if (video.owner.toString() !== req.user!._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }
    video.isPublished = !video.isPublished
    await video.save({ validateBeforeSave: false })
    const status = video.isPublished ? "published" : "unpublished"
    return res.status(200).json(new ApiResponse(200, video, `Video ${status} successfully`))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}