import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// sharp (used in src/lib/storage.ts to resize/compress uploads) loads its
// native binary dynamically based on the runtime platform, so Next.js's
// static output-file tracing can't discover it and prunes it from the
// deployed function — causing ERR_DLOPEN_FAILED at runtime in production
// even though the build itself succeeds. Vercel's Node.js functions run on
// linux-x64, so that's the only platform binary that needs to ship.
const SHARP_LINUX_X64_FILES = [
  "node_modules/@img/sharp-linux-x64/**/*",
  "node_modules/@img/sharp-libvips-linux-x64/**/*",
];

// Font used to write the visitor's name on the handbook PDF cover
// (src/lib/guide-pdf.ts). It's read from disk at runtime, and the handbook
// server action runs inside whichever page function the visitor is on, so
// every route needs it in its trace.
const GUIDE_PDF_FONT_FILES = ["./src/assets/fonts/BeVietnamPro-SemiBold.ttf"];

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/upload": SHARP_LINUX_X64_FILES,
    "/api/agent/upload": SHARP_LINUX_X64_FILES,
    "/**": GUIDE_PDF_FONT_FILES,
  },
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
