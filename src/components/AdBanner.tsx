
import React, { useEffect, useRef } from 'react';

const AdBanner: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 광고 스크립트가 없으면 추가
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      document.head.appendChild(script);
    }
    // 광고 렌더링 트리거
    if (window.adsbygoogle && adRef.current) {
      try {
        // @ts-ignore
        window.adsbygoogle.push({});
      } catch (e) {}
    }
  }, []);

  return (
    <div className="w-full max-w-md flex justify-center p-3 border border-gray-100 rounded-lg bg-white">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '90px' }}
        data-ad-client="ca-pub-XXXXXXX" // 본인 광고 ID로 교체
        data-ad-slot="YYYYYYY" // 본인 광고 슬롯으로 교체
        data-ad-format="auto"
        data-full-width-responsive="true"
        ref={adRef}
      />
    </div>
  );
};

export default AdBanner;
