// Cloudflare D1 数据库连接和操作

export class D1Database {
  constructor(db) {
    this.db = db;
  }

  // 推文相关操作
  async findTweetById(tweet_id) {
    try {
      const result = await this.db.prepare(
        'SELECT * FROM tweets WHERE tweet_id = ?'
      ).bind(tweet_id).first();
      
      if (result) {
        return {
          ...result,
          tweet_data: JSON.parse(result.tweet_data)
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding tweet:', error);
      throw error;
    }
  }

  async createTweet(tweetData) {
    try {
      const {
        name,
        screen_name,
        profile_image,
        tweet_id,
        tweet_text,
        tweet_media,
        tweet_threadscount,
        tweet_data,
        post_at
      } = tweetData;

      const result = await this.db.prepare(`
        INSERT INTO tweets (
          name, screen_name, profile_image, tweet_id, tweet_text,
          tweet_media, tweet_threadscount, tweet_data, post_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        name,
        screen_name,
        profile_image,
        tweet_id,
        tweet_text || null,
        tweet_media || null,
        tweet_threadscount || 0,
        JSON.stringify(tweet_data),
        post_at || new Date().toISOString()
      ).run();

      return result;
    } catch (error) {
      console.error('Error creating tweet:', error);
      throw error;
    }
  }

  async getRecentTweets(limit = 15) {
    try {
      const hiddenScreenNames = await this.getHiddenScreenNames();
      const hiddenCondition = hiddenScreenNames.length > 0 
        ? `AND screen_name NOT IN (${hiddenScreenNames.map(() => '?').join(', ')})`
        : '';

      const query = `
        SELECT * FROM tweets 
        WHERE is_hidden = 0 ${hiddenCondition}
        ORDER BY created_at DESC 
        LIMIT ?
      `;

      const result = await this.db.prepare(query)
        .bind(...hiddenScreenNames, limit)
        .all();

      return result.results || [];
    } catch (error) {
      console.error('Error getting recent tweets:', error);
      throw error;
    }
  }

  async getAllTweetIds() {
    try {
      const hiddenScreenNames = await this.getHiddenScreenNames();
      const hiddenCondition = hiddenScreenNames.length > 0 
        ? `AND screen_name NOT IN (${hiddenScreenNames.map(() => '?').join(', ')})`
        : '';

      const query = `
        SELECT tweet_id, post_at FROM tweets 
        WHERE is_hidden = 0 ${hiddenCondition}
      `;

      const result = await this.db.prepare(query)
        .bind(...hiddenScreenNames)
        .all();

      return result.results || [];
    } catch (error) {
      console.error('Error getting all tweet IDs:', error);
      throw error;
    }
  }

  async getRandomTweets(size = 10) {
    try {
      const hiddenScreenNames = await this.getHiddenScreenNames();
      const hiddenCondition = hiddenScreenNames.length > 0 
        ? `AND screen_name NOT IN (${hiddenScreenNames.map(() => '?').join(', ')})`
        : '';

      // SQLite 使用 RANDOM() 而不是 MongoDB 的 $sample
      const query = `
        SELECT * FROM tweets 
        WHERE is_hidden = 0 ${hiddenCondition}
        ORDER BY RANDOM() 
        LIMIT ?
      `;

      const result = await this.db.prepare(query)
        .bind(...hiddenScreenNames, size)
        .all();

      return result.results || [];
    } catch (error) {
      console.error('Error getting random tweets:', error);
      throw error;
    }
  }

  async searchTweets(searchParams) {
    try {
      const { name, screen_name, text, content_type, date_range } = searchParams;
      
      let conditions = ['is_hidden = 0'];
      let bindings = [];

      if (name) {
        conditions.push('name LIKE ?');
        bindings.push(`%${name}%`);
      }

      if (screen_name) {
        conditions.push('screen_name LIKE ?');
        bindings.push(`%${screen_name}%`);
      }

      if (text) {
        conditions.push('tweet_text LIKE ?');
        bindings.push(`%${text}%`);
      }

      if (content_type === 'video') {
        conditions.push('tweet_media LIKE ?');
        bindings.push('%.mp4%');
      } else if (content_type === 'image') {
        conditions.push('tweet_media IS NOT NULL AND tweet_media != "" AND tweet_media NOT LIKE ?');
        bindings.push('%.mp4%');
      }

      if (date_range) {
        const now = new Date();
        let daysAgo;
        
        switch (date_range) {
          case 'week':
            daysAgo = 7;
            break;
          case 'month':
            daysAgo = 30;
            break;
          case 'quarter':
            daysAgo = 90;
            break;
        }

        if (daysAgo) {
          const dateThreshold = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          conditions.push('post_at >= ?');
          bindings.push(dateThreshold.toISOString());
        }
      }

      const query = `
        SELECT * FROM tweets 
        WHERE ${conditions.join(' AND ')}
        ORDER BY post_at DESC 
        LIMIT 15
      `;

      const result = await this.db.prepare(query)
        .bind(...bindings)
        .all();

      return result.results || [];
    } catch (error) {
      console.error('Error searching tweets:', error);
      throw error;
    }
  }

  async deleteTweet(tweet_id) {
    try {
      const result = await this.db.prepare(
        'DELETE FROM tweets WHERE tweet_id = ?'
      ).bind(tweet_id).run();

      return result;
    } catch (error) {
      console.error('Error deleting tweet:', error);
      throw error;
    }
  }

  async hideTweet(tweet_id) {
    try {
      const result = await this.db.prepare(
        'UPDATE tweets SET is_hidden = 1 WHERE tweet_id = ?'
      ).bind(tweet_id).run();

      return result;
    } catch (error) {
      console.error('Error hiding tweet:', error);
      throw error;
    }
  }

  // 隐藏用户相关操作
  async addHiddenUser(screen_name) {
    try {
      const result = await this.db.prepare(
        'INSERT OR IGNORE INTO hiddens (screen_name) VALUES (?)'
      ).bind(screen_name).run();

      return result;
    } catch (error) {
      console.error('Error adding hidden user:', error);
      throw error;
    }
  }

  async getHiddenScreenNames() {
    try {
      const result = await this.db.prepare(
        'SELECT screen_name FROM hiddens'
      ).all();

      return (result.results || []).map(row => row.screen_name);
    } catch (error) {
      console.error('Error getting hidden screen names:', error);
      return [];
    }
  }

  async getTweetCount() {
    try {
      const hiddenScreenNames = await this.getHiddenScreenNames();
      const hiddenCondition = hiddenScreenNames.length > 0
        ? `AND screen_name NOT IN (${hiddenScreenNames.map(() => '?').join(', ')})`
        : '';

      const query = `
        SELECT COUNT(*) as count FROM tweets
        WHERE is_hidden = 0 ${hiddenCondition}
      `;

      const result = await this.db.prepare(query)
        .bind(...hiddenScreenNames)
        .first();

      return result?.count || 0;
    } catch (error) {
      console.error('Error getting tweet count:', error);
      return 0;
    }
  }

  async getTopCreators(limit = 10) {
    try {
      const hiddenScreenNames = await this.getHiddenScreenNames();
      const hiddenCondition = hiddenScreenNames.length > 0
        ? `AND screen_name NOT IN (${hiddenScreenNames.map(() => '?').join(', ')})`
        : '';

      const query = `
        SELECT
          name,
          screen_name,
          profile_image,
          COUNT(*) as tweet_count
        FROM tweets
        WHERE is_hidden = 0 ${hiddenCondition}
        GROUP BY screen_name, name, profile_image
        ORDER BY tweet_count DESC
        LIMIT ?
      `;

      const results = await this.db.prepare(query)
        .bind(...hiddenScreenNames, limit)
        .all();

      return results.results || [];
    } catch (error) {
      console.error('Error getting top creators:', error);
      return [];
    }
  }
}

// 获取数据库实例的辅助函数
export function getDatabase(env) {
  if (!env?.DB) {
    throw new Error('Database binding not found. Make sure D1 is properly configured.');
  }
  return new D1Database(env.DB);
}
