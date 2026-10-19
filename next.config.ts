import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.spoonacular.com", pathname: "/recipes/**" }]
  }
};

export default nextConfig;
