// Cloudflare Function for /api/requestx
import { getDatabase } from '../../src/lib/db-d1.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const tweet_id = url.searchParams.get('tweet_id');

  if (!tweet_id) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Tweet ID is required'
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 如果使用共享数据库
  if (env.NEXT_PUBLIC_USE_SHARED_DB === '1') {
    try {
      const response = await fetch(`https://api.twitterxdownload.com/api/requestx?tweet_id=${tweet_id}`);
      const data = await response.json();
      
      return new Response(JSON.stringify({
        ...data,
        message: 'from shared database'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Shared database request failed'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  try {
    const db = getDatabase(env);
    
    // 首先检查本地数据库
    const tweet = await db.findTweetById(tweet_id);
    if (tweet) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Tweet found in database',
        data: tweet.tweet_data
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 如果本地没有，从外部 API 获取
    const response = await fetch(`https://api.twitterxdownload.com/api/requestx?tweet_id=${tweet_id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    // 如果获取成功，保存到数据库
    if (data.success && data.data) {
      try {
        const tweetData = data.data;

        // 从推文数据中提取用户信息
        let userName = 'Unknown';
        let screenName = 'unknown';
        let profileImage = '';
        let tweetText = '';
        let tweetMedia = '';
        let threadsCount = 0;
        let postAt = new Date().toISOString();

        // 尝试从不同的数据结构中提取用户信息
        if (tweetData.data && tweetData.data.threaded_conversation_with_injections_v2) {
          const entries = tweetData.data.threaded_conversation_with_injections_v2.instructions[0]?.entries;
          if (entries && entries.length > 0) {
            for (const entry of entries) {
              if (entry.content?.__typename === "TimelineTimelineItem") {
                const tweet = entry.content.itemContent?.tweet_results?.result;
                if (tweet) {
                  const user = tweet.core?.user_results?.result?.legacy || tweet.tweet?.core?.user_results?.result?.legacy;
                  if (user) {
                    userName = user.name || 'Unknown';
                    screenName = user.screen_name || 'unknown';
                    profileImage = user.profile_image_url_https || '';
                  }

                  const legacy = tweet.legacy || tweet.tweet?.legacy;
                  if (legacy) {
                    tweetText = tweet.note_tweet?.note_tweet_results?.result?.text || legacy.full_text || '';
                    postAt = legacy.created_at || new Date().toISOString();

                    // 提取媒体信息
                    if (legacy.extended_entities?.media) {
                      const mediaUrls = legacy.extended_entities.media.map(media => {
                        if (media.type === 'video') {
                          const variants = media.video_info?.variants || [];
                          const mp4Variants = variants.filter(v => v.content_type === 'video/mp4');
                          if (mp4Variants.length > 0) {
                            mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
                            return mp4Variants[0].url;
                          }
                        }
                        return media.media_url_https;
                      });
                      tweetMedia = mediaUrls.join(',');
                    }
                  }
                  break; // 找到主推文后退出循环
                }
              }
            }
          }
        }

        await db.createTweet({
          name: userName,
          screen_name: screenName,
          profile_image: profileImage,
          tweet_id: tweet_id,
          tweet_text: tweetText,
          tweet_media: tweetMedia,
          tweet_threadscount: threadsCount,
          tweet_data: tweetData,
          post_at: postAt
        });
      } catch (dbError) {
        console.error('Failed to save tweet to database:', dbError);
        // 继续返回数据，即使保存失败
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in requestx:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
