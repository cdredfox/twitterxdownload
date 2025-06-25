#!/bin/bash

# Cloudflare Pages 专用构建脚本

echo "🔨 构建 Cloudflare Pages 项目..."

# 设置环境变量
export CLOUDFLARE_PAGES=1

# 清理之前的构建
echo "🧹 清理之前的构建..."
rm -rf .next out

# 构建项目（使用静态导出）
echo "📦 构建 Next.js 项目（静态导出）..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Next.js 构建失败"
    exit 1
fi

# Next.js 静态导出已经生成了 out 目录
echo "✅ Next.js 静态导出完成"

# 复制 Cloudflare 配置文件
echo "⚙️ 复制 Cloudflare 配置文件..."
cp _headers out/ 2>/dev/null || true
cp _redirects out/ 2>/dev/null || true

echo "✅ Cloudflare Pages 构建完成！"
echo "📁 输出目录: out/"
echo "🚀 可以使用以下命令部署:"
echo "   wrangler pages deploy out"
