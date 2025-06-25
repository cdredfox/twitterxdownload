// Cloudflare Function for /api/remains
export async function onRequestGet(context) {
  try {
    const response = await fetch('https://api.twitterxdownload.com/api/remains', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      data: data.data
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in remains:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
