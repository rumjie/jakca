
import React, { useEffect } from 'react';

// 카카오 애드핏 전역 타입 선언
declare global {
  interface Window {
    kakaoAdfit?: {
      ins: () => void;
    };
  }
}

const AdBanner: React.FC = () => {
  useEffect(() => {
    // 카카오 애드핏 스크립트가 이미 로드되었는지 확인
    if (window.kakaoAdfit) {
      window.kakaoAdfit.ins();
      return;
    }

    // 스크립트가 없으면 동적으로 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
    script.async = true;
    script.onload = () => {
      if (window.kakaoAdfit) {
        window.kakaoAdfit.ins();
      }
    };
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      const existingScript = document.querySelector('script[src="//t1.daumcdn.net/kas/static/ba.min.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center p-3 border border-gray-100 rounded-lg bg-white">
      <ins 
        className="kakao_ad_area" 
        style={{ display: 'none' }}
        data-ad-unit="DAN-HQhZ3WfcpHK5cY8y"
        data-ad-width="320"
        data-ad-height="50"
      />
    </div>
  );
};

export default AdBanner;
