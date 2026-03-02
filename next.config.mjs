/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // CesiumJS needs these Node polyfills disabled in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        url: false,
      };
    }

    // Load .glsl files as raw text strings
    config.module.rules.push({
      test: /\.glsl$/,
      type: "asset/source",
    });

    return config;
  },
};

export default nextConfig;
