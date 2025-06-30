"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

interface Comment {
  _id: string;
  content: string;
  articleId: {
    title: string;
    slug: string;
  };
  createdAt: string;
}

// Define a type for the user
interface ProfileUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserComments = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "https://trendwise-app-back.vercel.app"}/api/comments/user/history`,
        {
          headers: { Authorization: `Bearer ${session?.backendToken}` },
        }
      );
      setComments(res.data);
    } catch {
      console.error("Failed to fetch user comments");
    }
    setLoading(false);
  }, [session?.backendToken]);

  useEffect(() => {
    if (session?.user) {
      fetchUserComments();
    }
  }, [session, fetchUserComments]);

  if (!session) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const user = session.user as ProfileUser;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {user?.image && (
            <Image
              src={user.image}
              alt={user.name || "User"}
              className="w-16 h-16 rounded-full"
              width={64}
              height={64}
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-2 px-4 py-2 cursor-pointer rounded bg-gray-100 hover:bg-gray-200 text-sm font-medium border border-gray-200 text-gray-800"
        >
          Logout
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Comments ({comments.length})</h2>
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">You haven&apos;t commented on any articles yet.</p>
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