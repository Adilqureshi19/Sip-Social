// utils/getVideoDuration.js
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

// Tell fluent-ffmpeg where to find the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegStatic);

export const getVideoDuration = (localFilePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(localFilePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      resolve(duration); // in seconds (float)
    });
  });
};
