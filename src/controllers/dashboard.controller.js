import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user._id;

  // 1. Aggregate video stats
  const videoStats = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  const totalVideos = videoStats[0]?.totalVideos || 0;
  const totalViews = videoStats[0]?.totalViews || 0;

  // 2. Get all video IDs uploaded by the user
  const videoIds = await Video.find({ owner: userId }).distinct("_id");

  // 3. Count total likes on those videos
  const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

  // 4. Count total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });

  // 5. Send response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers,
      },
      "Channel statistics fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const userId = req.user._id;

  // Validate userId (though usually req.user._id is already valid)
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Get total number of videos uploaded by the channel
  const totalVideos = await Video.countDocuments({ owner: userId });

  // Fetch paginated videos
  const videos = await Video.find({ owner: userId })
    .sort({ createdAt: -1 }) // latest first
    .skip(skip)
    .limit(Number(limit))
    .select("title description thumbnail views createdAt isPublished");

  const totalPages = Math.ceil(totalVideos / Number(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalVideos,
        currentPage: Number(page),
        totalPages,
      },
      "Channel videos fetched successfully"
    )
  );
});

export { getChannelStats, getChannelVideos };
