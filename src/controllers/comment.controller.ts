import {Comment, CommentDocument} from "../models/comment.model"
import ApiError from "../utils/apiError"
import ApiResponse from "../utils/apiResponse"
import {asyncHandler} from "../utils/asyncHandler"

const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username fullName avatar")
        .sort({ createdAt: -1 })   // latest first
        .skip(skip)
        .limit(Number(limit));

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));


})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body ?? {};
    const userId = req.user!._id;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
});


const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body ?? {};
    const comment = req.resource as CommentDocument;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    comment.content = content;
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});



const deleteComment = asyncHandler(async (req, res) => {
    const comment = req.resource as CommentDocument;

    await comment.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"));
});


export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }