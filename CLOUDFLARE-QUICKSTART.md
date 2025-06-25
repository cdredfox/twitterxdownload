# 🚀 Cloudflare Pages 快速开始

## 5 分钟部署指南

### 1️⃣ 准备工作

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2️⃣ 一键部署

```bash
# 运行自动部署脚本
./deploy-cloudflare.sh
```

### 3️⃣ 配置环境变量和数据库

编辑 `wrangler.toml` 文件：

```toml
# 环境变量配置
[vars]
CLOUDFLARE_PAGES = "1"
ADMIN_PASSWORD = "your-secure-password"
NEXT_PUBLIC_USE_SHARED_DB = "0"
NEXT_PUBLIC_GA_MEASUREMENT_ID = "your-ga-id"
NEXT_PUBLIC_GOOGLE_ADSENSE_ID = "your-adsense-id"

# D1 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "twitterxdownload"
database_id = "your-database-id"  # 从 wrangler d1 create 命令获取
```

### 4️⃣ 完成！

访问 `https://your-project.pages.dev` 🎉

---

## 📋 详细步骤

### 构建命令

```bash
# 开发环境
npm run dev

# Cloudflare 构建
npm run build:cloudflare

# 本地预览
npm run cf:dev
```

### 数据库操作

```bash
# 创建数据库
npm run cf:db:create

# 运行迁移
npm run cf:db:migrate

# 查看数据
wrangler d1 execute twitterxdownload --command="SELECT COUNT(*) FROM tweets;"
```

### 部署命令

```bash
# 生产部署
npm run cf:deploy

# 预览部署
./deploy-cloudflare.sh preview
```

---

## 🔧 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理并重新构建
   rm -rf .next out
   npm run build:cloudflare
   ```

2. **数据库连接失败**
   - 检查 D1 绑定配置
   - 确认数据库 ID 正确

3. **环境变量未生效**
   - 在 Cloudflare Dashboard 中重新配置
   - 重新部署项目

### 查看日志

```bash
# 部署日志
wrangler pages deployment list --project-name=twitterxdownload

# 实时日志
wrangler pages deployment tail --project-name=twitterxdownload
```

---

## 📚 更多资源

- [完整部署指南](./README-Cloudflare.md)
- [Docker 部署](./README-Docker.md)
- [项目文档](./README.md)

---

## 💡 提示

- 使用免费额度足够大多数应用
- 全球 CDN 自动加速
- 支持自定义域名
- 内置 DDoS 防护
