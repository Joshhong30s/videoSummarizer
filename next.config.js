/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  webpack: (config, { isServer }) => {
    // ✅ 移除 Critical dependency 警告（Supabase）
    config.module.exprContextCritical = false;

    // ✅ 避免 Webpack 處理 Node.js 的核心模組
    config.externals.push(({ request }, callback) => {
      if (request?.startsWith?.('node:')) {
        return callback(null, `commonjs ${request}`);
      }
      if (isServer && request === 'ytdl-core') {
        return callback(null, `commonjs ytdl-core`);
      }
      callback();
    });

    // ✅ polyfill buffer（如果你用到了 Buffer）
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
    };

    return config;
  },
};

module.exports = nextConfig;
