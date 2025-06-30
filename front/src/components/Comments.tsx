"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Snackbar from "./Snackbar";
import Image from "next/image";

interface Comment {
  _id: string;
  content: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  likes: Array<{ userId: string }>;
}

interface CommentsProps {
  articleId: string;
}

export default function Comments({ articleId }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info"
  });

  const fetchComments = useCallback(async () => {
    // Check if offline before making the request
    if (!navigator.onLine) {
      setError("Comments will load once you get connected");
      setSnackbar({
        isVisible: true,
        message: "Comments will load once you get connected",
        type: "info"
      });
      return;
    }
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "https://trendwise-app-back.vercel.app"}/api/comments/${articleId}`,
        { timeout: 10000 } // 10 second timeout
      );
      setComments(res.data);
    } catch (err: unknown) {
      let errorMessage = "Failed to load comments";
      if (!navigator.onLine) {
        errorMessage = "Comments will load once you get connected";
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as { code?: string; message?: string; response?: { status?: number; data?: { message?: string } } };
        if (errorObj.code === 'NETWORK_ERROR' || errorObj.message?.includes('Network Error') || errorObj.message?.includes('fetch')) {
          errorMessage = "Comments will load once you get connected";
        } else if (errorObj.response?.status === 0) {
          errorMessage = "Comments will load once you get connected";
        } else if (errorObj.code === 'ECONNABORTED' || errorObj.message?.includes('timeout')) {
          errorMessage = "Comments will load once you get connected";
        } else if (errorObj.response?.data?.message) {
          errorMessage = errorObj.response.data.message;
        }
      }
      setError(errorMessage);
      if (errorMessage === "Comments will load once you get connected") {
        setSnackbar({
          isVisible: true,
          message: errorMessage,
          type: "info"
        });
      }
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [articleId, fetchComments]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Clear any offline-related error messages
      if (error.includes("will be posted") || error.includes("will load")) {
        setError("");
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial offline state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setError("");
    setLoading(true);
    
    // Check if offline before making the request
    if (!navigator.onLine) {
      setIsOffline(true);
      setSnackbar({
        isVisible: true,
        message: "Comment will be posted once you get connected",
        type: "info"
      });
      setError("Comment will be posted once you get connected");
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "https://trendwise-app-back.vercel.app"}/api/comments/${articleId}`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${session?.backendToken}` },
          timeout: 10000, // 10 second timeout
        }
      );
      setComments([res.data, ...comments]);
      setNewComment("");
      setError("");
      
      // Show success message
      setSnackbar({
        isVisible: true,
        message: "Comment posted successfully!",
        type: "success"
      });
    } catch (err: unknown) {
      let errorMessage = "Failed to post comment";
      if (!navigator.onLine) {
        errorMessage = "Comment will be posted once you get connected";
        setIsOffline(true);
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as { code?: string; message?: string; response?: { status?: number; data?: { message?: string } } };
        if (errorObj.code === 'NETWORK_ERROR' || errorObj.message?.includes('Network Error') || errorObj.message?.includes('fetch')) {
          errorMessage = "Comment will be posted once you get connected";
          setIsOffline(true);
        } else if (errorObj.response?.status === 0) {
          errorMessage = "Comment will be posted once you get connected";
          setIsOffline(true);
        } else if (errorObj.code === 'ECONNABORTED' || errorObj.message?.includes('timeout')) {
          errorMessage = "Comment will be posted once you get connected";
          setIsOffline(true);
        } else if (errorObj.response?.data?.message) {
          errorMessage = errorObj.response.data.message;
        }
      }
      setError(errorMessage);
      setSnackbar({
        isVisible: true,
        message: errorMessage,
        type: errorMessage.includes("will be posted") || errorMessage.includes("will load") ? "info" : "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments ({comments.length})</h3>
      
      {session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border rounded-lg resize-none"
            rows={3}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim() || isOffline}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : isOffline ? "Offline" : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <p>Please log in to comment.</p>
        </div>
      )}


      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {comment.userAvatar && (
                  <Image
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full"
                    width={32}
                    height={32}
                  />
                )}
                <span className="font-medium">{comment.userName}</span>
                <span className="text-gray-500 text-sm">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Snackbar for success/error messages */}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isVisible={snackbar.isVisible}
        onClose={closeSnackbar}
        duration={4000}
      />
    </div>
  );
} 