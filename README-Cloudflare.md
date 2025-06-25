# Cloudflare Pages 部署指南

本项目已配置好 Cloudflare Pages 支持，可以轻松地部署到 Cloudflare 的全球边缘网络。

## 文件说明

- `wrangler.toml`: Cloudflare Workers/Pages 配置文件
- `schema.sql`: Cloudflare D1 数据库模式
- `functions/`: Cloudflare Functions API 路由
- `_headers`: HTTP 头配置
- `_redirects`: 重定向规则配置
- `deploy-cloudflare.sh`: 自动部署脚本

## 前置要求

1. **Cloudflare 账户**: 注册 [Cloudflare](https://cloudflare.com) 账户
2. **Wrangler CLI**: 安装 Cloudflare 的命令行工具

```bash
npm install -g wrangler
```

3. **登录 Cloudflare**:
```bash
wrangler login
```

## 快速部署

### 方法 1: 使用自动部署脚本（推荐）

```bash
# 运行部署脚本
./deploy-cloudflare.sh

# 部署到预览环境
./deploy-cloudflare.sh preview
```

### 方法 2: 手动部署

```bash
# 1. 构建项目
npm run build:cloudflare

# 2. 创建 D1 数据库
npm run cf:db:create

# 3. 运行数据库迁移
npm run cf:db:migrate

# 4. 部署到 Cloudflare Pages
npm run cf:deploy
```

## 数据库配置

### 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create twitterxdownload

# 记录返回的数据库 ID，更新到 wrangler.toml 文件
```

### 运行数据库迁移

```bash
# 执行 SQL 模式文件
wrangler d1 execute twitterxdownload --file=./schema.sql
```

### 查看数据库

```bash
# 连接到数据库
wrangler d1 execute twitterxdownload --command="SELECT * FROM tweets LIMIT 5;"
```

## 环境变量配置

⚠️ **重要**: Cloudflare Pages 的环境变量必须通过 `wrangler.toml` 文件配置，不能在 Dashboard 中设置！

### 配置方法

编辑 `wrangler.toml` 文件中的 `[vars]` 部分：

```toml
[vars]
# 必需变量
CLOUDFLARE_PAGES = "1"
ADMIN_PASSWORD = "your-secure-password"
NEXT_PUBLIC_USE_SHARED_DB = "0"

# 可选变量
NEXT_PUBLIC_GA_MEASUREMENT_ID = "your-ga-id"
NEXT_PUBLIC_GOOGLE_ADSENSE_ID = "your-adsense-id"
HIDDEN_KEYWORDS = "spam,adult,inappropriate"
```

### 配置步骤

1. 编辑项目根目录的 `wrangler.toml` 文件
2. 在 `[vars]` 部分添加或修改环境变量
3. 重新部署项目: `wrangler pages deploy out`

详细配置指南请参考: [Wrangler 配置指南](./WRANGLER-CONFIG.md)

## 绑定 D1 数据库

⚠️ **重要**: D1 数据库绑定必须通过 `wrangler.toml` 文件配置，不能在 Dashboard 中设置！

### 配置方法

在 `wrangler.toml` 文件中配置 D1 绑定：

```toml
[[d1_databases]]
binding = "DB"                    # 在代码中使用的变量名
database_name = "twitterxdownload" # 数据库名称
database_id = "your-database-id"   # 实际的数据库 ID
```

### 获取数据库 ID

```bash
# 创建数据库时会返回 ID
wrangler d1 create twitterxdownload

# 或查看现有数据库
wrangler d1 list
```

## 自定义域名

1. 在 Cloudflare Dashboard 中进入 Pages 项目
2. 点击 "Custom domains"
3. 添加您的域名
4. 按照指示配置 DNS 记录

## 本地开发

```bash
# 安装依赖
npm install

# 本地开发（使用 Next.js）
npm run dev

# 本地开发（使用 Cloudflare Pages）
npm run build:cloudflare
npm run cf:dev
```

## 功能特性

### ✅ 已支持的功能

- 🌐 全球 CDN 加速
- 🗄️ Cloudflare D1 数据库
- 🔧 Serverless Functions
- 🌍 多语言国际化
- 📱 响应式设计
- 🔒 安全头配置
- 📊 Google Analytics 集成
- 💰 Google AdSense 集成

### 🔄 API 路由

所有原有的 API 路由都已转换为 Cloudflare Functions：

- `/api/requestx` - 获取推文数据
- `/api/requestdb` - 数据库查询
- `/api/remains` - 剩余配额查询
- `/api/tweet/delete` - 删除推文
- `/api/tweet/hide` - 隐藏推文/用户
- `/api/x/tweet` - Twitter API 代理

## 故障排除

### 查看部署日志

```bash
wrangler pages deployment list --project-name=twitterxdownload
```

### 查看函数日志

```bash
wrangler pages deployment tail --project-name=twitterxdownload
```

### 常见问题

1. **数据库连接失败**
   - 检查 D1 数据库是否正确绑定
   - 确认 `wrangler.toml` 中的数据库 ID 正确

2. **环境变量未生效**
   - 确认在 Cloudflare Dashboard 中正确配置
   - 重新部署项目

3. **国际化路由问题**
   - 检查 `_redirects` 文件配置
   - 确认 Functions 中间件正常工作

## 性能优化

- ✅ 静态资源 CDN 缓存
- ✅ 图片优化（unoptimized 模式）
- ✅ 边缘计算加速
- ✅ 自动压缩和优化

## 成本估算

Cloudflare Pages 提供慷慨的免费额度：

- **Pages**: 每月 100,000 次请求（免费）
- **Functions**: 每月 100,000 次调用（免费）
- **D1**: 每月 5GB 存储 + 25M 行读取（免费）

对于大多数应用来说，免费额度已经足够使用。

## 监控和分析

1. **Cloudflare Analytics**: 内置流量分析
2. **Real User Monitoring**: 真实用户体验监控
3. **Security Insights**: 安全威胁分析
4. **Performance Insights**: 性能优化建议

## 备份和恢复

```bash
# 导出数据库
wrangler d1 export twitterxdownload --output=backup.sql

# 恢复数据库
wrangler d1 execute twitterxdownload --file=backup.sql
```
