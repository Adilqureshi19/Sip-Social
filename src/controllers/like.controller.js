import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  let message = "";
  let result = null;

  if (existingLike) {
    await existingLike.deleteOne();
    message = "Video Unliked Successfully";
  } else {
    result = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    message = "Like created successfully";
  }

  return res.status(200).json(new ApiResponse(200, result, message));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on comment
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  let message = "";
  let result = null;

  if (existingLike) {
    await existingLike.deleteOne();
    message = "Comment unliked successfully";
  } else {
    result = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    message = "Comment liked successfully";
  }

  return res.status(200).json(new ApiResponse(200, result, message));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on tweet
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  let message = "";
  let result = null;

  if (existingLike) {
    await existingLike.deleteOne();
    message = "Tweet unliked successfully";
  } else {
    result = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    message = "Tweet liked successfully";
  }

  return res.status(200).json(new ApiResponse(200, result, message));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likes = await Like.find({ likedBy: req.user._id, video: { $ne: null } })
    .populate("video", "title thumbnail views owner")
    .sort({ createdAt: -1 });

  const likedVideos = likes.map((like) => like.video);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };