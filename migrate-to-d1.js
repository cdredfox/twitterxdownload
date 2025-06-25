#!/usr/bin/env node

// MongoDB 到 Cloudflare D1 数据迁移脚本

const fs = require('fs');
const path = require('path');

// 如果有 MongoDB 连接，可以使用这个脚本进行数据迁移
// 这里提供一个示例框架

async function migrateFromMongoDB() {
  console.log('🔄 开始数据迁移...');
  
  try {
    // 1. 连接到 MongoDB（需要安装 mongoose）
    // const mongoose = require('mongoose');
    // await mongoose.connect(process.env.MONGODB_URI);
    
    // 2. 获取数据
    // const Tweets = require('./src/lib/models/tweets');
    // const Hiddens = require('./src/lib/models/hiddens');
    
    // const tweets = await Tweets.find({}).lean();
    // const hiddens = await Hiddens.find({}).lean();
    
    // 3. 生成 SQL 插入语句
    console.log('📝 生成 SQL 插入语句...');
    
    // 示例数据（实际使用时替换为从 MongoDB 获取的数据）
    const sampleTweets = [
      {
        name: 'Sample User',
        screen_name: 'sample_user',
        profile_image: 'https://example.com/avatar.jpg',
        tweet_id: '1234567890',
        tweet_text: 'This is a sample tweet',
        tweet_media: null,
        tweet_threadscount: 0,
        tweet_data: JSON.stringify({ sample: 'data' }),
        is_hidden: 0,
        post_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ];
    
    const sampleHiddens = [
      {
        screen_name: 'hidden_user',
        created_at: new Date().toISOString()
      }
    ];
    
    // 生成 SQL 文件
    let sql = '-- 数据迁移 SQL 文件\n\n';
    
    // 插入推文数据
    if (sampleTweets.length > 0) {
      sql += '-- 插入推文数据\n';
      for (const tweet of sampleTweets) {
        sql += `INSERT INTO tweets (name, screen_name, profile_image, tweet_id, tweet_text, tweet_media, tweet_threadscount, tweet_data, is_hidden, post_at, created_at) VALUES (\n`;
        sql += `  '${escapeSql(tweet.name)}',\n`;
        sql += `  '${escapeSql(tweet.screen_name)}',\n`;
        sql += `  '${escapeSql(tweet.profile_image)}',\n`;
        sql += `  '${escapeSql(tweet.tweet_id)}',\n`;
        sql += `  ${tweet.tweet_text ? `'${escapeSql(tweet.tweet_text)}'` : 'NULL'},\n`;
        sql += `  ${tweet.tweet_media ? `'${escapeSql(tweet.tweet_media)}'` : 'NULL'},\n`;
        sql += `  ${tweet.tweet_threadscount || 0},\n`;
        sql += `  '${escapeSql(tweet.tweet_data)}',\n`;
        sql += `  ${tweet.is_hidden || 0},\n`;
        sql += `  '${tweet.post_at}',\n`;
        sql += `  '${tweet.created_at}'\n`;
        sql += `);\n\n`;
      }
    }
    
    // 插入隐藏用户数据
    if (sampleHiddens.length > 0) {
      sql += '-- 插入隐藏用户数据\n';
      for (const hidden of sampleHiddens) {
        sql += `INSERT INTO hiddens (screen_name, created_at) VALUES (\n`;
        sql += `  '${escapeSql(hidden.screen_name)}',\n`;
        sql += `  '${hidden.created_at}'\n`;
        sql += `);\n\n`;
      }
    }
    
    // 写入文件
    const outputFile = 'migration-data.sql';
    fs.writeFileSync(outputFile, sql);
    
    console.log(`✅ 迁移 SQL 文件已生成: ${outputFile}`);
    console.log('📋 下一步:');
    console.log(`   wrangler d1 execute twitterxdownload --file=./${outputFile}`);
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

// SQL 转义函数
function escapeSql(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
}

// 从 JSON 文件迁移的函数
async function migrateFromJSON(jsonFile) {
  console.log(`📂 从 JSON 文件迁移: ${jsonFile}`);
  
  try {
    if (!fs.existsSync(jsonFile)) {
      console.error(`❌ 文件不存在: ${jsonFile}`);
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    
    let sql = '-- 从 JSON 文件迁移的数据\n\n';
    
    // 处理推文数据
    if (data.tweets && Array.isArray(data.tweets)) {
      sql += '-- 插入推文数据\n';
      for (const tweet of data.tweets) {
        sql += `INSERT OR IGNORE INTO tweets (name, screen_name, profile_image, tweet_id, tweet_text, tweet_media, tweet_threadscount, tweet_data, is_hidden, post_at, created_at) VALUES (\n`;
        sql += `  '${escapeSql(tweet.name || 'Unknown')}',\n`;
        sql += `  '${escapeSql(tweet.screen_name || 'unknown')}',\n`;
        sql += `  '${escapeSql(tweet.profile_image || '')}',\n`;
        sql += `  '${escapeSql(tweet.tweet_id)}',\n`;
        sql += `  ${tweet.tweet_text ? `'${escapeSql(tweet.tweet_text)}'` : 'NULL'},\n`;
        sql += `  ${tweet.tweet_media ? `'${escapeSql(tweet.tweet_media)}'` : 'NULL'},\n`;
        sql += `  ${tweet.tweet_threadscount || 0},\n`;
        sql += `  '${escapeSql(typeof tweet.tweet_data === 'string' ? tweet.tweet_data : JSON.stringify(tweet.tweet_data))}',\n`;
        sql += `  ${tweet.is_hidden || 0},\n`;
        sql += `  '${tweet.post_at || new Date().toISOString()}',\n`;
        sql += `  '${tweet.created_at || new Date().toISOString()}'\n`;
        sql += `);\n\n`;
      }
    }
    
    // 处理隐藏用户数据
    if (data.hiddens && Array.isArray(data.hiddens)) {
      sql += '-- 插入隐藏用户数据\n';
      for (const hidden of data.hiddens) {
        sql += `INSERT OR IGNORE INTO hiddens (screen_name, created_at) VALUES (\n`;
        sql += `  '${escapeSql(hidden.screen_name)}',\n`;
        sql += `  '${hidden.created_at || new Date().toISOString()}'\n`;
        sql += `);\n\n`;
      }
    }
    
    const outputFile = 'migration-from-json.sql';
    fs.writeFileSync(outputFile, sql);
    
    console.log(`✅ 迁移 SQL 文件已生成: ${outputFile}`);
    console.log('📋 执行迁移:');
    console.log(`   wrangler d1 execute twitterxdownload --file=./${outputFile}`);
    
  } catch (error) {
    console.error('❌ JSON 迁移失败:', error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 数据迁移工具');
    console.log('');
    console.log('用法:');
    console.log('  node migrate-to-d1.js mongodb     # 从 MongoDB 迁移');
    console.log('  node migrate-to-d1.js json <file> # 从 JSON 文件迁移');
    console.log('');
    console.log('示例:');
    console.log('  node migrate-to-d1.js json data.json');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'mongodb':
      await migrateFromMongoDB();
      break;
    case 'json':
      if (args.length < 2) {
        console.error('❌ 请指定 JSON 文件路径');
        process.exit(1);
      }
      await migrateFromJSON(args[1]);
      break;
    default:
      console.error(`❌ 未知命令: ${command}`);
      process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateFromMongoDB, migrateFromJSON };
