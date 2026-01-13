"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const VideoInfo = ({ video }: any) => {
  const { user } = useUser();

  const [likes, setLikes] = useState(video?.Like || 0);
  const [dislikes, setDislikes] = useState(video?.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    setLikes(video?.Like || 0);
    setDislikes(video?.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  // 👁️ Handle views
  useEffect(() => {
    if (!video?._id) return;

    const handleViews = async () => {
      try {
        if (user) {
          await axiosInstance.post(`/history/${video._id}`, {
            userId: user._id,
          });
        } else {
          await axiosInstance.post(`/history/views/${video._id}`);
        }
      } catch (err) {
        console.log(err);
      }
    };

    handleViews();
  }, [video, user]);

  // 👍 LIKE
  const handleLike = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user._id,
      });

      if (res.data.liked) {
        setLikes((prev: number) => (isLiked ? prev - 1 : prev + 1));
        setIsLiked(!isLiked);

        if (isDisliked) {
          setDislikes((prev: number) => prev - 1);
          setIsDisliked(false);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 👎 DISLIKE
  const handleDislike = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user._id,
      });

      if (!res.data.liked) {
        setDislikes((prev: number) => (isDisliked ? prev - 1 : prev + 1));
        setIsDisliked(!isDisliked);

        if (isLiked) {
          setLikes((prev: number) => prev - 1);
          setIsLiked(false);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ⏰ WATCH LATER
  const handleWatchLater = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user._id,
      });
      setIsWatchLater(res.data.watchlater);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔗 SHARE
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Video link copied!");
  };

  // ⬇️ DOWNLOAD (only for uploaded videos)
  const handleDownload = () => {
    if (!video?.filepath) return;

    const link = document.createElement("a");
    link.href = `http://localhost:5000/${video.filepath}`;
    link.download = video.filename || "video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{video?.videotitle}</h1>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{video?.videochanel?.[0]}</AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium">{video?.videochanel}</h3>
            <p className="text-sm text-gray-600">Subscribers</p>
          </div>

          <Button className="ml-4">Subscribe</Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button variant="ghost" size="sm" onClick={handleLike}>
              <ThumbsUp
                className={`w-5 h-5 mr-2 ${
                  isLiked ? "fill-black text-black" : ""
                }`}
              />
              {likes}
            </Button>

            <div className="w-px h-6 bg-gray-300" />

            <Button variant="ghost" size="sm" onClick={handleDislike}>
              <ThumbsDown
                className={`w-5 h-5 mr-2 ${
                  isDisliked ? "fill-black text-black" : ""
                }`}
              />
              {dislikes}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
            onClick={handleWatchLater}
          >
            <Clock className="w-5 h-5 mr-2" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
            onClick={handleShare}
          >
            <Share className="w-5 h-5 mr-2" /> Share
          </Button>

          {/* ✅ DOWNLOAD SHOWN ONLY FOR UPLOADED VIDEOS */}
          {video?.filepath && !video.filepath.startsWith("http") && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-gray-100 rounded-full"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5 mr-2" /> Download
            </Button>
          )}

          <Button variant="ghost" size="icon" className="bg-gray-100 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex gap-4 text-sm font-medium mb-2">
          <span>{video?.views || 0} views</span>
          <span>
            {video?.createdAt
              ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
              : "just now"}
          </span>
        </div>

        <p className={`text-sm ${showFullDescription ? "" : "line-clamp-3"}`}>
          Sample video description.
        </p>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
