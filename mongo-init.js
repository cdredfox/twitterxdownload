// MongoDB 初始化脚本
// 这个脚本会在 MongoDB 容器首次启动时执行

// 切换到 twitterxdownload 数据库
db = db.getSiblingDB('twitterxdownload');

// 创建应用用户（可选，如果需要更细粒度的权限控制）
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'twitterxdownload'
    }
  ]
});

// 创建一些基础集合（可选）
db.createCollection('users');
db.createCollection('tweets');
db.createCollection('downloads');

// 插入一些示例数据（可选）
db.users.insertOne({
  _id: ObjectId(),
  name: 'System',
  createdAt: new Date(),
  type: 'system'
});

print('MongoDB 初始化完成');
