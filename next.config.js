/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // 确保环境变量在构建时可用
  env: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_GOOGLE_ADSENSE_ID: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID,
    NEXT_PUBLIC_USE_SHARED_DB: process.env.NEXT_PUBLIC_USE_SHARED_DB,
  },
  // 在构建时显示环境变量信息
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      console.log('🔍 Build-time environment variables:');
      console.log('NEXT_PUBLIC_GA_MEASUREMENT_ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
      console.log('NEXT_PUBLIC_GOOGLE_ADSENSE_ID:', process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID);
      console.log('NEXT_PUBLIC_USE_SHARED_DB:', process.env.NEXT_PUBLIC_USE_SHARED_DB);
    }
    return config;
  }
};

module.exports = nextConfig;
