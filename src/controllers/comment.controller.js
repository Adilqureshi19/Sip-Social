import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }

  const totalComments = await Comment.countDocuments({ video: videoId });

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $addFields: {
        owner: { $first: "$user" },
      },
    },
    {
      $project: {
        content: 1,
        "owner.fullName": 1,
        "owner.avatar": 1,
        createdAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    {
      $limit: Number(limit),
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          comments,
          totalComments,
          currentPage: Number(page),
          totalPages: Math.ceil(totalComments / limit),
        },
        "Comments Fetched Successfully!"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const {videoId} = req.params;
  const {content} = req.body

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid VideoId")
  }

  if (!content?.trim()) {
    throw new ApiError(401, "Content missing")
  }

  const newComment = await Comment.create({
    owner: req.user._id,
    video: videoId,
    content: content.trim()
  })

  return res.status(200).json(new ApiResponse(200, newComment, "Comment Added Successfully"))
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const {commentId} = req.params

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId")
  }

  const {content} = req.body
  
  if (!content.trim()) {
    throw new ApiError(400, "No Content Found")
  }

  const existingComment = await Comment.findById(commentId)

  if (!existingComment) {
    throw new ApiError(400, "Comment not found")
  }

  if (existingComment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not Allowed to update this comment")
  }

  const updatedComment = await Comment.findByIdAndUpdate(commentId, {
    $set: {
      content: content  
    }
  },{new: true})

  return res.status(200).json(new ApiResponse(200, updatedComment, "Comment Updated Successfully!"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId")
  }

  const existingComment = await Comment.findById(commentId)

  if (!existingComment) {
    throw new ApiError(400, "Comment not found")
  }

  if (existingComment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not allowed to delete this comment")
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId, {new: true})

  return res.status(200).json(new ApiResponse(200, deletedComment, "Comment deleted successfully"))
});

export { getVideoComments, addComment, updateComment, deleteComment };
