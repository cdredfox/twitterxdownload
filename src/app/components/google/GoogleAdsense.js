'use client';

import Script from 'next/script';

export default function GoogleAdsense() {
  // 只有在配置了 AdSense ID 时才加载脚本
  if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID === 'your-adsense-client-id') {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}`}
        crossOrigin="anonymous"
      />
    </>
  );
}