import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    domains: ['localhost', 'your-image-domain.com','lh3.googleusercontent.com'], // Add your image domains
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable compression
  compress: true,
  
  // Output configuration
  output: 'standalone',
};

export default nextConfig;
