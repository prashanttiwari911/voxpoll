import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  turbopack: {
    root: __dirname,
  },

  async rewrites() {
    return [
      {
        source: "/api/sentiment/:path*",
        // Proxy to sentiment microservice, defaults to Docker Compose service name or localhost
        destination: (process.env.SENTIMENT_SERVICE_URL || "http://localhost:8000") + "/:path*", 
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;