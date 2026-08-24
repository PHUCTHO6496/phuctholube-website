import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      // fal.media: AI-generated blog cover images the content agent
      // sometimes references directly instead of re-hosting on our own
      // Blob store. Subdomain varies by CDN edge node (v1b, v2b, v3b...).
      {
        protocol: "https",
        hostname: "*.fal.media",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
