import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip/brotli compression for the Node output (Vercel does this at the
  // edge regardless, but keeps `next start` fast for local/self-hosted use).
  compress: true,

  // Strip the "X-Powered-By: Next.js" response header — trivial, but no
  // reason to advertise the framework on every response.
  poweredByHeader: false,

  // Fail the build on TypeScript errors rather than silently shipping
  // broken code — matches the "npm run build must pass" rule this
  // project already holds itself to. (ESLint errors already fail the
  // build by default in Next 16 — no config key needed for that.)
  typescript: { ignoreBuildErrors: false },

  experimental: {
    // Only ship the specific icons/exports actually imported from
    // lucide-react instead of bundling the full icon set per route.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
