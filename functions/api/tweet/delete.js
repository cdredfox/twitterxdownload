// Cloudflare Function for /api/tweet/delete
import { getDatabase } from '../../../src/lib/db-d1.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const adminpwd = url.searchParams.get('adminpwd');
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
    await db.deleteTweet(tweet_id);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Tweet deleted from database'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting tweet:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
