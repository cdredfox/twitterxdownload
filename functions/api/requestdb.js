// Cloudflare Function for /api/requestdb
import { getDatabase } from '../../src/lib/db-d1.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  // 如果使用共享数据库
  if (env.NEXT_PUBLIC_USE_SHARED_DB === '1') {
    try {
      const response = await fetch(`https://api.twitterxdownload.com/api/requestdb?${action ? `action=${action}` : ''}`);
      const data = await response.json();
      
      return new Response(JSON.stringify({
        message: 'from shared database',
        ...data
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
    let allData;
    let count = 0;

    if (!action || action === 'recent') {
      allData = await db.getRecentTweets(15);
      count = await db.getTweetCount();
    } else if (action === 'all') {
      allData = await db.getAllTweetIds();
      count = allData.length;
    } else if (action === 'random') {
      allData = await db.getRandomTweets(10);
      count = allData.length;
    } else if (action === 'detail') {
      const tweet_id = url.searchParams.get('tweet_id');
      if (!tweet_id) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Tweet ID is required for detail action'
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const tweet = await db.findTweetById(tweet_id);
      allData = tweet ? [tweet] : [];
      count = allData.length;
    } else if (action === 'search') {
      const searchParams = {
        name: url.searchParams.get('name'),
        screen_name: url.searchParams.get('screen_name'),
        text: url.searchParams.get('text'),
        content_type: url.searchParams.get('content_type'),
        date_range: url.searchParams.get('date_range')
      };

      allData = await db.searchTweets(searchParams);
      count = allData.length;
    } else if (action === 'creators') {
      allData = await db.getTopCreators(20);
      count = allData.length;
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid action parameter'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      count: count,
      data: allData
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in requestdb:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
