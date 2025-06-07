/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  webpack: (config, { isServer }) => {
    config.module.exprContextCritical = false;

    config.externals.push(({ request }, callback) => {
      if (request?.startsWith?.('node:')) {
        return callback(null, `commonjs ${request}`);
      }
      if (
        isServer &&
        (request === 'ytdl-core' || request === '@distube/ytdl-core')
      ) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    });

    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
    };

    return config;
  },
};

module.exports = nextConfig;
