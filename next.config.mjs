/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

const nextConfig = {
  env: {
    APP_VERSION: packageJson.version
  },
  experimental: {
    forceSwcTransforms: true,
  },
  reactStrictMode: false, // 禁用严格模式，避免在开发过程中useEffect执行2次
  // 根据环境选择输出模式
  output: process.env.CLOUDFLARE_PAGES ? 'export' : 'standalone',
  // Cloudflare Pages 配置
  ...(process.env.CLOUDFLARE_PAGES && {
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    assetPrefix: undefined,
    distDir: 'out'
  })
}

export default nextConfig