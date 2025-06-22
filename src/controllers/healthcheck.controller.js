import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  let dbStatus = "disconnected";
  let fileStorageStatus = "unreachable";

  // Check MongoDB connection
  if (mongoose.connection.readyState === 1) {
    dbStatus = "connected";
  }

  // Check Cloudinary reachability
  try {
    const ping = await cloudinary.api.ping();
    if (ping.status === "ok") {
      fileStorageStatus = "reachable";
    }
  } catch (error) {
    // Cloudinary is not reachable
    fileStorageStatus = "unreachable";
  }

  const systemStatus = {
    server: "running",
    database: dbStatus,
    fileStorage: fileStorageStatus,
    timestamp: new Date().toISOString(),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, systemStatus, "Healthcheck OK"));
});

export { healthcheck };
