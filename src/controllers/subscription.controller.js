import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // 1. Check if channelId is valid
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // 2. Prevent user from subscribing to themselves
  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  // 3. Check if subscription already exists
  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  let message = "";
  let result = null;

  if (existingSubscription) {
    // 4a. If exists → unsubscribe
    await existingSubscription.deleteOne();
    message = "Unsubscribed from channel successfully";
  } else {
    // 4b. If not exists → create new subscription
    result = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    message = "Subscribed to channel successfully";
  }

  // 5. Return response
  return res.status(200).json(new ApiResponse(200, result, message));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // controller to return subscriber list of a channel
  
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid ChannelId");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [subscribers, total] = await Promise.all([
    Subscription.aggregate([
      {
        $match: { channel: new mongoose.Types.ObjectId(channelId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscribersInfo",
        },
      },
      {
        $addFields: { subscriber: { $first: "$subscribersInfo" } },
      },
      {
        $project: {
          "subscriber._id": 1,
          "subscriber.fullName": 1,
          "subscriber.username": 1,
          "subscriber.avatar": 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]),
    Subscription.countDocuments({ channel: channelId }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribers,
        totalSubscribers: total,
        currentPage: Number(page),
        totalPages,
      },
      "Subscribers fetched with pagination"
    )
  );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [channels, total] = await Promise.all([
    Subscription.aggregate([
      {
        $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channelInfo",
        },
      },
      {
        $addFields: {
          channel: { $first: "$channelInfo" },
        },
      },
      {
        $project: {
          "channel._id": 1,
          "channel.fullName": 1,
          "channel.username": 1,
          "channel.avatar": 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]),
    Subscription.countDocuments({ subscriber: subscriberId }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        channels,
        totalSubscribedChannels: total,
        currentPage: Number(page),
        totalPages,
      },
      "Subscribed channels fetched with pagination"
    )
  );
});


export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
