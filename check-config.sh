#!/bin/bash

# Cloudflare Pages 配置检查脚本

echo "🔍 检查 Cloudflare Pages 配置..."
echo "================================"

# 检查 wrangler.toml 文件
if [ ! -f "wrangler.toml" ]; then
    echo "❌ 未找到 wrangler.toml 文件"
    exit 1
fi

echo "✅ wrangler.toml 文件存在"

# 检查数据库配置
echo ""
echo "📊 检查 D1 数据库配置:"

if grep -q "database_id.*your-database-id" wrangler.toml; then
    echo "⚠️  数据库 ID 仍为默认值，需要创建数据库"
    echo "   运行: wrangler d1 create twitterxdownload"
elif grep -q "database_id" wrangler.toml; then
    db_id=$(grep "database_id" wrangler.toml | cut -d'"' -f2)
    echo "✅ 数据库 ID 已配置: $db_id"
else
    echo "❌ 未找到数据库配置"
fi

# 检查绑定配置
if grep -q 'binding = "DB"' wrangler.toml; then
    echo "✅ 数据库绑定已配置"
else
    echo "❌ 数据库绑定未配置"
fi

# 检查环境变量
echo ""
echo "🔧 检查环境变量配置:"

required_vars=("CLOUDFLARE_PAGES" "ADMIN_PASSWORD" "NEXT_PUBLIC_USE_SHARED_DB")
optional_vars=("NEXT_PUBLIC_GA_MEASUREMENT_ID" "NEXT_PUBLIC_GOOGLE_ADSENSE_ID" "HIDDEN_KEYWORDS")

for var in "${required_vars[@]}"; do
    if grep -q "$var" wrangler.toml; then
        value=$(grep "$var" wrangler.toml | cut -d'"' -f2)
        echo "✅ $var = \"$value\""
    else
        echo "❌ 缺少必需变量: $var"
    fi
done

echo ""
echo "📋 可选环境变量:"
for var in "${optional_vars[@]}"; do
    if grep -q "$var" wrangler.toml; then
        value=$(grep "$var" wrangler.toml | cut -d'"' -f2)
        echo "✅ $var = \"$value\""
    else
        echo "⚪ 未配置: $var"
    fi
done

# 检查构建输出
echo ""
echo "📦 检查构建输出:"

if [ -d "out" ]; then
    echo "✅ 构建输出目录存在"
    
    if [ -f "out/index.html" ]; then
        echo "✅ 根页面存在"
    else
        echo "⚠️  根页面不存在"
    fi
    
    if [ -d "out/_next" ]; then
        echo "✅ Next.js 静态资源存在"
    else
        echo "⚠️  Next.js 静态资源不存在"
    fi
    
    if [ -f "out/_headers" ]; then
        echo "✅ HTTP 头配置存在"
    else
        echo "⚠️  HTTP 头配置不存在"
    fi
    
    if [ -f "out/_redirects" ]; then
        echo "✅ 重定向配置存在"
    else
        echo "⚠️  重定向配置不存在"
    fi
else
    echo "❌ 构建输出目录不存在，请运行: npm run build:cloudflare"
fi

# 检查 wrangler CLI
echo ""
echo "🛠️  检查工具:"

if command -v wrangler &> /dev/null; then
    wrangler_version=$(wrangler --version)
    echo "✅ Wrangler CLI: $wrangler_version"
    
    # 检查登录状态
    if wrangler whoami &> /dev/null; then
        user=$(wrangler whoami 2>/dev/null | head -1)
        echo "✅ 已登录 Cloudflare: $user"
    else
        echo "⚠️  未登录 Cloudflare，请运行: wrangler login"
    fi
else
    echo "❌ Wrangler CLI 未安装，请运行: npm install -g wrangler"
fi

# 总结
echo ""
echo "📋 配置总结:"
echo "============"

# 计算配置完成度
total_checks=0
passed_checks=0

# 基本文件检查
if [ -f "wrangler.toml" ]; then
    ((passed_checks++))
fi
((total_checks++))

# 数据库配置检查
if ! grep -q "database_id.*your-database-id" wrangler.toml && grep -q "database_id" wrangler.toml; then
    ((passed_checks++))
fi
((total_checks++))

# 环境变量检查
for var in "${required_vars[@]}"; do
    if grep -q "$var" wrangler.toml; then
        ((passed_checks++))
    fi
    ((total_checks++))
done

# 构建输出检查
if [ -d "out" ]; then
    ((passed_checks++))
fi
((total_checks++))

# Wrangler CLI 检查
if command -v wrangler &> /dev/null; then
    ((passed_checks++))
fi
((total_checks++))

percentage=$((passed_checks * 100 / total_checks))

echo "配置完成度: $passed_checks/$total_checks ($percentage%)"

if [ $percentage -eq 100 ]; then
    echo "🎉 配置完成！可以部署了"
    echo "运行: ./deploy-cloudflare.sh"
elif [ $percentage -ge 80 ]; then
    echo "⚠️  配置基本完成，但有一些可选项未配置"
    echo "可以尝试部署: ./deploy-cloudflare.sh"
else
    echo "❌ 配置不完整，请检查上述问题"
fi

echo ""
echo "📚 更多帮助:"
echo "- 详细配置指南: ./WRANGLER-CONFIG.md"
echo "- 快速开始: ./CLOUDFLARE-QUICKSTART.md"
echo "- 完整文档: ./README-Cloudflare.md"
