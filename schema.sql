-- Cloudflare D1 数据库模式
-- 用于替代 MongoDB 的 SQL 模式

-- 推文表
CREATE TABLE IF NOT EXISTS tweets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    screen_name TEXT NOT NULL,
    profile_image TEXT NOT NULL,
    tweet_id TEXT NOT NULL UNIQUE,
    tweet_text TEXT,
    tweet_media TEXT,
    tweet_threadscount INTEGER DEFAULT 0,
    tweet_data TEXT NOT NULL,
    is_hidden INTEGER DEFAULT 0,
    post_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 隐藏用户表
CREATE TABLE IF NOT EXISTS hiddens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    screen_name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tweets_screen_name ON tweets(screen_name);
CREATE INDEX IF NOT EXISTS idx_tweets_name ON tweets(name);
CREATE INDEX IF NOT EXISTS idx_tweets_tweet_text ON tweets(tweet_text);
CREATE INDEX IF NOT EXISTS idx_tweets_tweet_media ON tweets(tweet_media);
CREATE INDEX IF NOT EXISTS idx_tweets_created_at ON tweets(created_at);
CREATE INDEX IF NOT EXISTS idx_tweets_post_at ON tweets(post_at);
CREATE INDEX IF NOT EXISTS idx_tweets_is_hidden ON tweets(is_hidden);
CREATE INDEX IF NOT EXISTS idx_tweets_tweet_id ON tweets(tweet_id);

-- 隐藏用户表索引
CREATE INDEX IF NOT EXISTS idx_hiddens_screen_name ON hiddens(screen_name);
CREATE INDEX IF NOT EXISTS idx_hiddens_created_at ON hiddens(created_at);
