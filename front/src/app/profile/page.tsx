"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Comment {
  _id: string;
  content: string;
  articleId: {
    title: string;
    slug: string;
  };
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchUserComments();
    }
  }, [session]);

  const fetchUserComments = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/comments/user/history`,
        {
          headers: { Authorization: `Bearer ${session?.backendToken}` },
        }
      );
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch user comments");
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const user = session.user as any;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {user?.image && (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Comments ({comments.length})</h2>
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">You haven't commented on any articles yet.</p>
        ) : (
          <div className="space-y-4">
            {comments
              .filter(comment => comment.articleId && comment.articleId.slug)
              .map((comment) => (
                <div key={comment._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/article/${comment.articleId.slug}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {comment.articleId.title}
                    </Link>
                    <span className="text-gray-500 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
} 