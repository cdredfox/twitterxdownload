'use client';

import Script from 'next/script';

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // 调试信息
  console.log('GA ID:', gaId);

  // 只有在配置了 GA ID 时才加载脚本
  if (!gaId || gaId === 'your-ga-id-here') {
    console.log('Google Analytics not loaded: Invalid or missing GA ID');
    return null;
  }

  console.log('Loading Google Analytics with ID:', gaId);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        onLoad={() => console.log('Google Analytics script loaded')}
        onError={(e) => console.error('Google Analytics script failed to load:', e)}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            console.log('Initializing Google Analytics with ID: ${gaId}');
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
            console.log('Google Analytics initialized');
          `,
        }}
      />
    </>
  );
}