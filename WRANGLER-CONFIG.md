# Wrangler 配置指南

## 📋 概述

Cloudflare Pages 的 D1 数据库绑定和环境变量必须通过 `wrangler.toml` 文件配置，而不是在 Dashboard 中手动设置。

## 🔧 配置文件结构

### wrangler.toml 配置说明

```toml
name = "twitterxdownload"
compatibility_date = "2024-06-24"
pages_build_output_dir = "out"

# D1 数据库绑定
[[d1_databases]]
binding = "DB"                                    # 在代码中使用的变量名
database_name = "twitterxdownload"               # 数据库名称
database_id = "ea3b3bea-0b8c-44d4-b2c4-1a940fc0576a"  # 实际数据库 ID

# 全局环境变量
[vars]
NODE_ENV = "production"
CLOUDFLARE_PAGES = "1"
NEXT_PUBLIC_USE_SHARED_DB = "0"
ADMIN_PASSWORD = "your-password"
NEXT_PUBLIC_GA_MEASUREMENT_ID = "your-ga-id"
NEXT_PUBLIC_GOOGLE_ADSENSE_ID = "your-adsense-id"

# 生产环境特定配置
[env.production]
[env.production.vars]
NODE_ENV = "production"
# 生产环境特定的变量...

# 预览环境特定配置
[env.preview]
[env.preview.vars]
NODE_ENV = "development"
# 预览环境特定的变量...
```

## 🗄️ D1 数据库管理

### 创建数据库
```bash
# 创建新的 D1 数据库
wrangler d1 create twitterxdownload

# 输出示例:
# ✅ Successfully created DB 'twitterxdownload'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "twitterxdownload"
# database_id = "ea3b3bea-0b8c-44d4-b2c4-1a940fc0576a"
```

### 运行数据库迁移
```bash
# 执行 SQL 模式文件
wrangler d1 execute twitterxdownload --file=./schema.sql

# 执行单个 SQL 命令
wrangler d1 execute twitterxdownload --command="SELECT COUNT(*) FROM tweets;"
```

### 查看数据库
```bash
# 列出所有数据库
wrangler d1 list

# 查看数据库信息
wrangler d1 info twitterxdownload

# 导出数据库
wrangler d1 export twitterxdownload --output=backup.sql
```

## 🔐 环境变量管理

### 必需的环境变量
```toml
[vars]
# 标识 Cloudflare Pages 环境
CLOUDFLARE_PAGES = "1"

# 管理员密码
ADMIN_PASSWORD = "your-secure-password"

# 数据库配置
NEXT_PUBLIC_USE_SHARED_DB = "0"  # 0=使用D1, 1=使用共享API
```

### 可选的环境变量
```toml
[vars]
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-XXXXXXXXXX"

# Google AdSense
NEXT_PUBLIC_GOOGLE_ADSENSE_ID = "ca-pub-xxxxxxxxxx"

# 隐藏关键词
HIDDEN_KEYWORDS = "spam,adult,inappropriate"

# 应用 URL
NEXT_PUBLIC_APP_URL = "https://your-domain.pages.dev"
```

## 🚀 部署流程

### 1. 配置 wrangler.toml
```bash
# 编辑配置文件
nano wrangler.toml

# 或使用您喜欢的编辑器
code wrangler.toml
```

### 2. 创建和配置数据库
```bash
# 如果是首次部署
wrangler d1 create twitterxdownload

# 运行数据库迁移
wrangler d1 execute twitterxdownload --file=./schema.sql
```

### 3. 构建和部署
```bash
# 构建项目
npm run build:cloudflare

# 部署到 Cloudflare Pages
wrangler pages deploy out

# 或使用自动化脚本
./deploy-cloudflare.sh
```

## 🔄 更新配置

### 修改环境变量
1. 编辑 `wrangler.toml` 文件
2. 重新部署项目

```bash
# 修改配置后重新部署
wrangler pages deploy out
```

### 更新数据库模式
```bash
# 运行新的迁移
wrangler d1 execute twitterxdownload --file=./new-migration.sql
```

## 🔍 调试和监控

### 查看部署日志
```bash
# 列出部署历史
wrangler pages deployment list --project-name=twitterxdownload

# 查看实时日志
wrangler pages deployment tail --project-name=twitterxdownload
```

### 测试 Functions
```bash
# 本地开发服务器
wrangler pages dev out --compatibility-date=2024-06-24

# 测试特定 Function
curl http://localhost:8788/api/requestdb?action=recent
```

## ⚠️ 重要注意事项

### 1. 数据库 ID
- 每个 D1 数据库都有唯一的 ID
- 必须在 `wrangler.toml` 中正确配置
- 不能在 Dashboard 中修改

### 2. 环境变量
- 只能通过 `wrangler.toml` 配置
- Dashboard 中的环境变量设置对 Pages 无效
- 修改后需要重新部署

### 3. 绑定名称
- D1 绑定名称 `DB` 在代码中使用
- 不要修改绑定名称，除非同时更新代码

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查数据库配置
   wrangler d1 info twitterxdownload
   
   # 验证绑定配置
   grep -A 3 "d1_databases" wrangler.toml
   ```

2. **环境变量未生效**
   ```bash
   # 检查配置语法
   wrangler pages deploy out --dry-run
   
   # 验证变量配置
   grep -A 10 "\[vars\]" wrangler.toml
   ```

3. **部署失败**
   ```bash
   # 查看详细错误信息
   wrangler pages deploy out --verbose
   ```

## 📚 相关命令参考

```bash
# 数据库相关
wrangler d1 create <name>           # 创建数据库
wrangler d1 list                    # 列出数据库
wrangler d1 delete <name>           # 删除数据库
wrangler d1 execute <name> --file=<file>  # 执行 SQL 文件

# Pages 相关
wrangler pages deploy <dir>         # 部署到 Pages
wrangler pages dev <dir>            # 本地开发
wrangler pages deployment list     # 查看部署历史
wrangler pages deployment tail     # 查看实时日志

# 配置相关
wrangler whoami                     # 查看登录状态
wrangler login                      # 登录 Cloudflare
wrangler logout                     # 登出
```
