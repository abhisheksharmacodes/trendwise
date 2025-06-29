import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TrendWise - Trending Articles & Insights",
    template: "%s | TrendWise"
  },
  description: "Discover the latest trending articles, insights, and analysis on current topics. Stay informed with our curated content.",
  keywords: ["trending", "articles", "news", "insights", "analysis", "current events"],
  authors: [{ name: "TrendWise Team" }],
  creator: "TrendWise",
  publisher: "TrendWise",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "TrendWise - Trending Articles & Insights",
    description: "Discover the latest trending articles, insights, and analysis on current topics.",
    siteName: "TrendWise",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrendWise - Trending Articles & Insights",
    description: "Discover the latest trending articles, insights, and analysis on current topics.",
    creator: "@trendwise",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
