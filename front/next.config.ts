import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // WILDCARD FOR ANY HOSTNAME (USE WITH EXTREME CAUTION IN PRODUCTION)
      {
        protocol: 'https',
        hostname: '**', // Allows any HTTPS hostname
      },
      {
        protocol: 'http', // If you need to allow HTTP sources too (less secure)
        hostname: '**', // Allows any HTTP hostname
      },
    ],
  },
  
  // Enable compression
  compress: true,
  
  // Output configuration
  output: 'standalone',
};

export default nextConfig;
