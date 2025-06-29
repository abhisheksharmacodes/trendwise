"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Snackbar from "@/components/Snackbar";

const errorMessages: Record<string, string> = {
  OAuthSignin: "Error in constructing an authorization URL. Please try again.",
  OAuthCallback: "Error in handling the response from Google. Please try again.",
  OAuthCreateAccount: "Could not create an account from your Google profile.",
  EmailCreateAccount: "Could not create an account with your email.",
  Callback: "Error during sign-in callback. Please try again.",
  OAuthAccountNotLinked: "This Google account is already linked to another user. Please use the originally linked account.",
  EmailSignin: "Error sending the email. Please try again.",
  CredentialsSignin: "Sign in failed. Check your credentials and try again.",
  SessionRequired: "You must be signed in to access this page.",
  default: "Login failed. Please try again."
};

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: "",
    type: "error" as "success" | "error" | "info"
  });

  useEffect(() => {
    if (session) {
      // Already logged in
      setSnackbar(prev => ({ ...prev, isVisible: false }));
    } else if (searchParams.get("error")) {
      const code = searchParams.get("error") || "default";
      const errorMessage = errorMessages[code] || errorMessages.default;
      setSnackbar({
        isVisible: true,
        message: errorMessage,
        type: "error"
      });
    }
  }, [session, searchParams]);

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isVisible: false }));
  };

  if (status === "loading") return <div>Loading...</div>;

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-4">You are already logged in!</h1>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 text-lg mb-2"
        >
          Go to Homepage
        </button>
        <span className="text-gray-500">If you want to use another account, please log out first.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-4">Login to TrendWise</h1>
      <button
        onClick={() => signIn("google")}
        className="px-6 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 text-lg"
      >
        Sign in with Google
      </button>

      {/* Snackbar for error messages */}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isVisible={snackbar.isVisible}
        onClose={closeSnackbar}
        duration={6000}
      />
    </div>
  );
} 