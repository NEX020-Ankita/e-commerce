import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rukminim1.flixcart.com',
      },
      {
        protocol: 'https',
        hostname: 'zpjrvqmlzsbpalttpfuy.supabase.co',
      },
    ],
  },
};

export default nextConfig;
