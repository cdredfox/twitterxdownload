#!/bin/bash

# Cloudflare Pages 部署脚本

echo "🚀 Cloudflare Pages 部署脚本"
echo "============================"

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "📦 正在安装 wrangler..."
    npm install -g wrangler
fi

# 检查是否已登录 Cloudflare
echo "🔐 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "🔑 请先登录 Cloudflare:"
    wrangler login
fi

# 构建项目
echo "🔨 构建项目..."
npm run build:cloudflare

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建完成"

# 检查数据库配置
echo "🗄️ 检查数据库配置..."

# 检查 wrangler.toml 中是否有有效的数据库 ID
if grep -q "database_id.*your-database-id" wrangler.toml; then
    echo "⚠️  检测到默认数据库 ID，需要创建新的 D1 数据库"
    read -p "是否创建新的 D1 数据库？(y/n): " create_db

    if [ "$create_db" = "y" ] || [ "$create_db" = "Y" ]; then
        echo "📊 创建 D1 数据库..."
        db_output=$(wrangler d1 create twitterxdownload)
        echo "$db_output"

        # 尝试从输出中提取数据库 ID
        db_id=$(echo "$db_output" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

        if [ -n "$db_id" ]; then
            echo "🔧 自动更新 wrangler.toml 中的数据库 ID..."
            sed -i.bak "s/database_id = \"your-database-id\"/database_id = \"$db_id\"/" wrangler.toml
            echo "✅ 数据库 ID 已更新: $db_id"
        else
            echo "⚠️  请手动将数据库 ID 更新到 wrangler.toml 文件中的 database_id 字段"
            read -p "按回车键继续..."
        fi

        echo "🔄 运行数据库迁移..."
        wrangler d1 execute twitterxdownload --file=./schema.sql
    fi
else
    echo "✅ 数据库配置已存在"
    read -p "是否运行数据库迁移？(y/n): " run_migration

    if [ "$run_migration" = "y" ] || [ "$run_migration" = "Y" ]; then
        echo "🔄 运行数据库迁移..."
        wrangler d1 execute twitterxdownload --file=./schema.sql
    fi
fi

# 部署到 Cloudflare Pages
echo "🌐 部署到 Cloudflare Pages..."

if [ "$1" = "preview" ]; then
    echo "🔍 部署到预览环境..."
    wrangler pages deploy out --project-name=twitterxdownload --env=preview
else
    echo "🚀 部署到生产环境..."
    wrangler pages deploy out --project-name=twitterxdownload
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "📋 配置说明:"
    echo "✅ D1 数据库绑定: 已通过 wrangler.toml 自动配置"
    echo "✅ 环境变量: 已通过 wrangler.toml 自动配置"
    echo ""
    echo "🔧 如需修改配置:"
    echo "1. 编辑 wrangler.toml 文件中的 [vars] 部分"
    echo "2. 重新运行部署: wrangler pages deploy out"
    echo ""
    echo "📝 可配置的环境变量:"
    echo "   - NEXT_PUBLIC_GA_MEASUREMENT_ID (Google Analytics)"
    echo "   - NEXT_PUBLIC_GOOGLE_ADSENSE_ID (Google AdSense)"
    echo "   - ADMIN_PASSWORD (管理员密码)"
    echo "   - HIDDEN_KEYWORDS (隐藏关键词)"
    echo ""
    echo "🌐 访问您的应用: https://twitterxdownload.pages.dev"
    echo "📊 Cloudflare Dashboard: https://dash.cloudflare.com"
else
    echo "❌ 部署失败"
    exit 1
fi
