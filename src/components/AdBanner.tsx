
import React, { useEffect, useRef } from 'react';

const AdBanner: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 광고 스크립트가 없으면 추가
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1432896495948592";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
    // 광고 렌더링 트리거
    // @ts-ignore
    if (window.adsbygoogle && adRef.current) {
      try {
        // @ts-ignore
        window.adsbygoogle.push({});
      } catch (e) {}
    }
  }, []);

  return (
    <div className="w-full flex justify-center p-3 border border-gray-100 rounded-lg bg-white">
      <ins
        className="adsbygoogle"
        // style={{ display: 'block', width: '100%', height: '90px' }} // - 원본
        // // style={{
        // //   display: 'block',
        // //   width: '100%',
        // //   height: window.innerWidth < 600 ? '100px' : '90px'
        // // }}
        // data-ad-client="ca-pub-XXXXXXX" // 본인 광고 ID로 교체
        // data-ad-slot="YYYYYYY" // 본인 광고 슬롯으로 교체
        // data-ad-format="auto"
        // data-full-width-responsive="true"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-gw-3+1f-3d+2z"
        data-ad-client="ca-pub-1432896495948592"
        data-ad-slot="6520176233"
        ref={adRef}
      />
    </div>
  );
};

export default AdBanner;
