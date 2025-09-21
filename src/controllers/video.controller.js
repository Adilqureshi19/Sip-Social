import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getVideoDuration } from "../utils/getVideoDuration.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "UserId missing");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const totalVideos = await Video.countDocuments({ owner: userObjectId });

  const totalPages = Math.ceil(totalVideos / Number(limit));

  const sortField = sortBy || "createdAt";
  const sortDirection = sortType === "asc" ? 1 : -1;

  const allVideos = await Video.aggregate([
    {
      $match: {
        owner: userObjectId,
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        duration: 1,
        owner: 1,
        createdAt: 1,
        views: 1,
      },
    },
    {
      $sort: {
        [sortField]: sortDirection,
      },
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
        { allVideos, totalVideos, currentPage: Number(page), totalPages },
        "All videos Fetched successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title) {
    throw new ApiError(400, "Title missing");
  }
  if (!description) {
    throw new ApiError(400, "description missing");
  }

  const videoLocalPath = req.files?.videoFile;
  const thumbnailLocalPath = req.files?.thumbnail;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video local path missing");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail local path missing");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video || !video?.public_id) {
    throw new ApiError(400, "video url missing");
  }

  if (!thumbnail || !thumbnail?.public_id) {
    throw new ApiError(400, "Thumbnail url missing");
  }

  // Get video duration from local file before it's deleted
  const duration = await getVideoDuration(videoLocalPath);

  const publishedVideo = await Video.create({
    videoFile: video.url,
    videoPublicId: video.public_id,
    thumbnail: thumbnail.url,
    thumbnailPublicId: thumbnail.public_id,
    title: title,
    description: description,
    duration: duration,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, publishedVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "videoId not found or Invalid");
  }
  const Videos = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $addFields: {
        owner: {
          $cond: {
            if: { $isArray: "$userInfo" },
            then: { $first: "$userInfo" },
            else: "$userInfo",
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        videoFile: 1,
        duration: 1,
        views: 1,
        "owner.fullName": 1,
        "owner.avatar": 1,
        createdAt: 1,
        isPublished: 1,
      },
    },
  ]);

  if (!Videos.length) {
    throw new ApiError(400, "Video not found");
  }

  const videoData = Videos[0];

  if (videoData.isPublished === true) {
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video fetched successfully!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "VideoId not found");
  }
  // 2. Find the existing video
  const existingVideo = await Video.findById(videoId);

  if (!existingVideo) {
    throw new ApiError(404, "Video not found");
  }

  // 3. Check if the current user is the owner
  if (existingVideo.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // 4. Get update data from req.body
  const { title, description } = req.body;

  // 5. Optional: handle new thumbnail upload
  let updatedFields = {
    ...(title && { title }),
    ...(description && { description }),
  };

  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (thumbnailLocalPath) {
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!uploadedThumbnail?.url) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }
    updatedFields.thumbnail = uploadedThumbnail.url;
  }

  // 6. Update the video
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updatedFields },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  // 1. Validate videoId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  // 2. Find the video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // 3. Check if the logged-in user is the owner
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // 4. Delete video from Cloudinary (both video file and thumbnail)
  await cloudinary.uploader.destroy(video.videoPublicId, {
    resource_type: "video",
  });

  await cloudinary.uploader.destroy(video.thumbnailPublicId, {
    resource_type: "image",
  });

  // 5. Delete from DB
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  // 6. Send response
  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video ID not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to toggle that video.");
  }

  const updatedPublishStatus = await Video.findByIdAndUpdate(
    videoId,
    {
      isPublished: !video.isPublished,
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPublishStatus,
        "Video publish toggled successfully"
      )
    );
});

const getVideosByChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  const videos = await Video.find({ owner: channelId })
    .select("thumbnail title duration views createdAt isPublished")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideosByChannel,
};
