/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // ✅ Force Webpack to use browser-safe PDF.js build (no 'canvas' dependency)
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "pdfjs-dist/build/pdf": "pdfjs-dist/web/pdf_viewer",
        "pdfjs-dist": "pdfjs-dist/web/pdf_viewer",
      };
    }
    return config;
  },

  experimental: {
    turbo: {
      // ✅ Force Turbopack (Next 15) to use browser-safe version too
      resolveAlias: {
        "pdfjs-dist/build/pdf": "pdfjs-dist/web/pdf_viewer",
        "pdfjs-dist": "pdfjs-dist/web/pdf_viewer",
      },
    },
  },
};

export default nextConfig;
