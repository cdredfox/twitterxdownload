import { NextResponse } from 'next/server';
import { locales } from './lib/i18n';

export function middleware(request) {
  // 在 Cloudflare Pages 环境下，中间件功能有限
  // 主要的路由逻辑将由 functions/_middleware.js 处理

  // 如果是 Cloudflare Pages 环境，直接通过
  if (process.env.CLOUDFLARE_PAGES) {
    return NextResponse.next();
  }

  // 获取请求的路径
  const pathname = request.nextUrl.pathname;

  // 检查路径是否已经包含语言代码
  const pathnameHasLocale = Object.keys(locales).map(locale => `/${locale}`).some(
    (localePath) => pathname.startsWith(localePath)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // 检查是否有 referer 头，如果有，尝试从中提取语言
  const referer = request.headers.get('referer');
  let preferredLocale = 'en';

  if (referer) {
    const refererUrl = new URL(referer);
    const refererPathname = refererUrl.pathname;

    // 尝试从 referer URL 中提取语言
    const localeFromReferer = Object.keys(locales).find(locale =>
      refererPathname.startsWith(`/${locale}`)
    );

    if (localeFromReferer) {
      preferredLocale = localeFromReferer;
    }
  }

  // 如果从 referer 中没有找到语言，再使用 Accept-Language
  if (preferredLocale === 'en' && !referer) {
    const acceptLanguage = request.headers.get('accept-language') || '';

    preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => {
        const cleanLang = lang.split(';')[0].trim();
        if (cleanLang.includes('zh') && cleanLang !== 'zh-CN') {
          return 'zh-HK';
        }
        return cleanLang;
      })
      .find((lang) => Object.keys(locales).includes(lang)) || 'en';
  }

  // 如果是英文，不进行重定向，但重写请求到 /en 路径
  if (preferredLocale === 'en') {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    url.search = request.nextUrl.search; // 保留原始URL的查询参数
    // 使用 rewrite 而不是 redirect
    return NextResponse.rewrite(url);
  }

  // 重定向到带语言代码的URL
  const redirectUrl = new URL(`/${preferredLocale}${pathname}`, request.url);
  redirectUrl.search = request.nextUrl.search; // 保留原始URL的查询参数
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    // 匹配所有路径，除了：
    // - api 路由
    // - _next 内部路由
    // - 静态文件
    '/((?!api|_next/static|_next/image|favicon.ico|ads.txt|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}; 