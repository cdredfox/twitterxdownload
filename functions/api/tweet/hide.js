// Cloudflare Function for /api/tweet/hide
import { getDatabase } from '../../../src/lib/db-d1.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const adminpwd = url.searchParams.get('adminpwd');
  const tweet_id = url.searchParams.get('tweet_id');
  const screen_name = url.searchParams.get('screen_name');

  if (!tweet_id && !screen_name) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Tweet ID or Screen Name is required'
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!adminpwd || adminpwd !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid admin password'
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const db = getDatabase(env);

    if (tweet_id) {
      await db.hideTweet(tweet_id);
    } else if (screen_name) {
      await db.addHiddenUser(screen_name);
    }
    
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error hiding tweet/user:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
