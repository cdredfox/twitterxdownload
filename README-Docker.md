# Docker 部署指南

本项目已配置好 Docker 支持，可以轻松地在容器中运行 TwitterXDownload 应用。

## 文件说明

- `Dockerfile`: 多阶段构建的 Docker 镜像配置
- `.dockerignore`: 排除不需要复制到镜像中的文件
- `docker-compose.yml`: Docker Compose 配置文件
- `next.config.mjs`: 已启用 `standalone` 输出模式

## 快速开始

### 方法 1: 使用 Docker Compose（推荐）

```bash
# 构建并启动应用
docker-compose up --build

# 后台运行
docker-compose up -d --build

# 停止应用
docker-compose down
```

### 方法 2: 使用 Docker 命令

```bash
# 构建镜像
docker build -t twitterxdownload .

# 运行容器
docker run -p 3000:3000 twitterxdownload

# 后台运行
docker run -d -p 3000:3000 --name twitterx-app twitterxdownload
```

## 访问应用

应用启动后，可以通过以下地址访问：
- http://localhost:3000

## MongoDB 连接

项目已配置好 MongoDB 支持：

### 使用 Docker Compose（推荐）
- MongoDB 容器会自动启动
- 默认用户名：`admin`，密码：`password`
- 数据库名：`twitterxdownload`
- 连接字符串：`mongodb://admin:password@mongodb:27017/twitterxdownload?authSource=admin`

### MongoDB 管理
```bash
# 连接到 MongoDB 容器
docker-compose exec mongodb mongosh -u admin -p password --authenticationDatabase admin

# 查看数据库
show dbs

# 使用 twitterxdownload 数据库
use twitterxdownload

# 查看集合
show collections
```

### 数据持久化
- MongoDB 数据存储在 Docker volume `mongodb_data` 中
- 数据在容器重启后会保持

## 环境变量

### 方法 1: 使用 .env.local 文件（推荐）
```bash
# 复制模板文件
cp .env.local.template .env.local

# 编辑配置，填入您的实际值
nano .env.local
```

**重要环境变量说明：**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 测量 ID
- `NEXT_PUBLIC_GOOGLE_ADSENSE_ID`: Google AdSense 客户端 ID
- `ADMIN_PASSWORD`: 管理员密码
- `MONGODB_URI`: MongoDB 连接字符串（Docker 环境下已预配置）

**注意：**
- 以 `NEXT_PUBLIC_` 开头的变量会暴露给客户端
- `.env.local` 文件不会被复制到 Docker 镜像中，确保安全性

### 方法 2: 在 docker-compose.yml 中配置
已在 `docker-compose.yml` 中预配置了 MongoDB 连接。

### 方法 3: 使用 Docker 命令传递
```bash
docker run -p 3000:3000 -e NODE_ENV=production -e MONGODB_URI=your_mongodb_uri twitterxdownload
```

## 生产部署注意事项

### 安全配置
1. **修改默认密码**: 更改 MongoDB 的默认用户名和密码
2. **环境变量**: 使用安全的环境变量管理
3. **网络安全**: 限制 MongoDB 端口的外部访问

### 性能优化
1. **资源限制**: 设置适当的内存和 CPU 限制
2. **数据库优化**: 配置 MongoDB 索引和连接池
3. **备份策略**: 设置定期数据备份

### 示例生产配置
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    # ... 应用配置
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  mongodb:
    # ... MongoDB 配置
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

## 故障排除

### 查看日志
```bash
# Docker Compose
docker-compose logs app

# Docker
docker logs container_name
```

### 进入容器调试
```bash
# Docker Compose
docker-compose exec app sh

# Docker
docker exec -it container_name sh
```

### 重新构建
```bash
# 清理并重新构建
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## 镜像优化

当前 Dockerfile 已经进行了以下优化：
- 多阶段构建减少镜像大小
- 使用 Alpine Linux 基础镜像
- 启用 Next.js standalone 输出
- 非 root 用户运行
- 合理的层缓存策略
