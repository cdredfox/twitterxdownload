// Cloudflare Function for /api/x/tweet
export async function onRequestPost(context) {
  const { request } = context;

  try {
    // 获取请求数据
    const postData = await request.json();

    // 检查是否有推文数据
    if (!postData) {
      return new Response(JSON.stringify({
        error: '缺少请求数据'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取 OAuth 认证头信息
    const oauthHeader = request.headers.get('authorization');

    if (!oauthHeader) {
      return new Response(JSON.stringify({
        error: '缺少认证信息'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Twitter API v2 地址
    const apiUrl = 'https://api.twitter.com/2/tweets';

    // 发送请求到 Twitter API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': oauthHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: 'Twitter API 请求失败',
        details: data
      }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in x/tweet:', error);
    return new Response(JSON.stringify({
      error: '服务器内部错误',
      details: error.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
