#!/bin/bash

# TwitterXDownload Docker 启动脚本

echo "🚀 TwitterXDownload Docker 启动脚本"
echo "=================================="

# 检查 .env.local 文件是否存在
if [ ! -f ".env.local" ]; then
    echo "⚠️  未找到 .env.local 文件"
    echo "📝 正在从模板创建 .env.local 文件..."
    
    if [ -f ".env.local.template" ]; then
        cp .env.local.template .env.local
        echo "✅ 已创建 .env.local 文件"
        echo "📋 请编辑 .env.local 文件，填入您的实际配置值："
        echo "   - NEXT_PUBLIC_GA_MEASUREMENT_ID"
        echo "   - NEXT_PUBLIC_GOOGLE_ADSENSE_ID"
        echo "   - ADMIN_PASSWORD"
        echo ""
        read -p "是否现在编辑 .env.local 文件？(y/n): " edit_env
        if [ "$edit_env" = "y" ] || [ "$edit_env" = "Y" ]; then
            ${EDITOR:-nano} .env.local
        fi
    else
        echo "❌ 未找到 .env.local.template 文件"
        exit 1
    fi
fi

echo ""
echo "🐳 启动 Docker 容器..."

# 检查是否传入了参数
if [ "$1" = "prod" ]; then
    echo "🏭 使用生产环境配置启动..."
    docker-compose -f docker-compose.prod.yml up --build -d
elif [ "$1" = "build" ]; then
    echo "🔨 重新构建并启动..."
    docker-compose up --build -d
elif [ "$1" = "logs" ]; then
    echo "📋 查看日志..."
    docker-compose logs -f
elif [ "$1" = "stop" ]; then
    echo "🛑 停止容器..."
    docker-compose down
elif [ "$1" = "restart" ]; then
    echo "🔄 重启容器..."
    docker-compose down
    docker-compose up -d
else
    echo "🚀 启动开发环境..."
    docker-compose up -d
fi

if [ "$1" != "stop" ] && [ "$1" != "logs" ]; then
    echo ""
    echo "✅ 启动完成！"
    echo "🌐 应用地址: http://localhost:3000"
    echo "🗄️  MongoDB: localhost:27017"
    echo ""
    echo "📋 常用命令:"
    echo "   查看日志: ./start-docker.sh logs"
    echo "   停止服务: ./start-docker.sh stop"
    echo "   重启服务: ./start-docker.sh restart"
    echo "   重新构建: ./start-docker.sh build"
    echo "   生产环境: ./start-docker.sh prod"
fi
