# 🚀 Wrangler 部署指南

## ✅ 重要说明

Cloudflare Pages 的配置必须通过 `wrangler.toml` 文件管理，Dashboard 中的设置对 Pages 项目无效！

## 📋 配置清单

### 1. 环境变量配置
✅ 在 `wrangler.toml` 中的 `[vars]` 部分配置
❌ 不要在 Cloudflare Dashboard 中设置环境变量

### 2. D1 数据库绑定
✅ 在 `wrangler.toml` 中的 `[[d1_databases]]` 部分配置
❌ 不要在 Dashboard 的 Functions 设置中绑定数据库

## 🔧 当前配置状态

根据配置检查脚本的结果，您的项目配置已完成：

```
✅ wrangler.toml 文件存在
✅ D1 数据库 ID 已配置
✅ 数据库绑定已配置
✅ 所有必需环境变量已配置
✅ 构建输出已生成
✅ Wrangler CLI 已安装并登录
```

## 🚀 立即部署

您现在可以直接部署到 Cloudflare Pages：

```bash
# 方法 1: 使用自动化脚本（推荐）
./deploy-cloudflare.sh

# 方法 2: 手动部署
wrangler pages deploy out
```

## 📝 配置文件示例

您的 `wrangler.toml` 应该包含以下配置：

```toml
name = "twitterxdownload"
compatibility_date = "2024-06-24"
pages_build_output_dir = "out"

# D1 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "twitterxdownload"
database_id = "ea3b3bea-0b8c-44d4-b2c4-1a940fc0576a"

# 环境变量
[vars]
NODE_ENV = "production"
CLOUDFLARE_PAGES = "1"
NEXT_PUBLIC_USE_SHARED_DB = "0"
ADMIN_PASSWORD = "snnuiabc"
NEXT_PUBLIC_GA_MEASUREMENT_ID = "your-ga-id-here"
NEXT_PUBLIC_GOOGLE_ADSENSE_ID = "your-adsense-client-id"
HIDDEN_KEYWORDS = "spam,adult,inappropriate"
```

## 🔄 修改配置

如需修改配置：

1. **编辑 wrangler.toml 文件**
   ```bash
   nano wrangler.toml
   # 或使用您喜欢的编辑器
   ```

2. **重新部署**
   ```bash
   wrangler pages deploy out
   ```

## 🗄️ 数据库管理

### 查看数据库状态
```bash
# 列出所有数据库
wrangler d1 list

# 查看数据库信息
wrangler d1 info twitterxdownload

# 查询数据
wrangler d1 execute twitterxdownload --command="SELECT COUNT(*) FROM tweets;"
```

### 运行数据库迁移
```bash
# 执行模式文件
wrangler d1 execute twitterxdownload --file=./schema.sql

# 如果有数据迁移
node migrate-to-d1.js mongodb  # 从 MongoDB 迁移
node migrate-to-d1.js json data.json  # 从 JSON 文件迁移
```

## 📊 监控和调试

### 查看部署状态
```bash
# 部署历史
wrangler pages deployment list --project-name=twitterxdownload

# 实时日志
wrangler pages deployment tail --project-name=twitterxdownload
```

### 本地测试
```bash
# 本地开发服务器
wrangler pages dev out --compatibility-date=2024-06-24

# 测试 API
curl http://localhost:8788/api/requestdb?action=recent
```

## ⚠️ 常见错误

### 1. 环境变量未生效
**错误**: 在 Dashboard 中设置了环境变量但不生效
**解决**: 必须在 `wrangler.toml` 中配置

### 2. 数据库连接失败
**错误**: `Database binding not found`
**解决**: 检查 `wrangler.toml` 中的 D1 绑定配置

### 3. 部署失败
**错误**: 各种部署错误
**解决**: 运行 `./check-config.sh` 检查配置

## 🎯 最佳实践

1. **版本控制**: 将 `wrangler.toml` 加入版本控制
2. **敏感信息**: 敏感的环境变量值不要提交到代码库
3. **环境分离**: 使用 `[env.production]` 和 `[env.preview]` 分离环境
4. **定期备份**: 定期备份 D1 数据库

## 🔗 相关资源

- [Wrangler 配置详细指南](./WRANGLER-CONFIG.md)
- [Cloudflare Pages 文档](./README-Cloudflare.md)
- [快速开始指南](./CLOUDFLARE-QUICKSTART.md)
- [Cloudflare 官方文档](https://developers.cloudflare.com/pages/)

## 🎉 部署成功后

部署成功后，您的应用将在以下地址可用：
- **主域名**: `https://twitterxdownload.pages.dev`
- **自定义域名**: 可在 Dashboard 中配置

享受全球 CDN 加速和零维护的便利！
