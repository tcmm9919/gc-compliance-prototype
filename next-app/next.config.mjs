/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  // Static export for GitHub Pages
  output: "export",

  // GitHub Pages serves under /gc-prototype/
  basePath: isProd ? "/gc-prototype" : "",
  assetPrefix: isProd ? "/gc-prototype/" : "",

  // Required for static export (no Next.js image optimizer)
  images: { unoptimized: true },

  // Trailing slash plays nicer with GitHub Pages routing
  trailingSlash: true,

  // Skip lint/typecheck during build (we run separately in CI)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
