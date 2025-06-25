// Cloudflare Function for /api/search
// 专门用于搜索推文的外部 API 调用

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 获取搜索参数
  const searchParams = {
    name: url.searchParams.get('name') || '',
    screen_name: url.searchParams.get('screen_name') || '',
    text: url.searchParams.get('text') || '',
    content_type: url.searchParams.get('content_type') || 'all',
    date_range: url.searchParams.get('date_range') || 'all'
  };

  // 检查是否有搜索条件
  if (!searchParams.name.trim() && !searchParams.screen_name.trim() && !searchParams.text.trim()) {
    return new Response(JSON.stringify({
      success: false,
      error: 'At least one search parameter is required'
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 构建外部 API 请求参数
    const apiParams = new URLSearchParams({
      action: 'search',
      name: searchParams.name,
      screen_name: searchParams.screen_name,
      text: searchParams.text,
      content_type: searchParams.content_type,
      date_range: searchParams.date_range
    });

    // 调用外部搜索 API
    const response = await fetch(`https://api.twitterxdownload.com/api/requestdb?${apiParams.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'TwitterXDownload/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`External API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Search results from external API',
      count: data.count || 0,
      data: data.data || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in search API:', error);
    
    // 返回错误，但不暴露内部错误信息
    return new Response(JSON.stringify({
      success: false,
      error: 'Search service temporarily unavailable',
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
