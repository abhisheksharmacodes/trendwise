"use client";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

// Extend the session user type to include jwt and role
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  jwt?: string;
  role?: string;
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as ExtendedUser;

  return (
    <nav className="flex items-center justify-between py-4 px-6 mb-2 bg-white shadow-sm border border-gray-100 sticky top-0 z-30">
      <Link href="/" className="active:underline text-2xl font-extrabold tracking-tight text-blue-700 font-geist-sans">
        TrendWise
      </Link>
      <div className="flex items-center gap-4">
        {status === "loading" ? null : user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 hover:underline font-medium text-gray-700"
            >
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                />
              )}
              <span className="font-medium text-gray-800">{user.name}</span>
            </Link>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow"
          >
            Login with Google
          </button>
        )}
      </div>
    </nav>
  );
} 