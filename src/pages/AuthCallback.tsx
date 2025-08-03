import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/auth';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsProcessing(true);
        const result = await AuthService.handleAuthCallback();
        
        if (result.error) {
          setError(result.error.message);
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        } else {
          // 성공적으로 로그인됨
          navigate('/');
        }
      } catch (error) {
        setError('인증 처리 중 오류가 발생했습니다.');
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">로그인 처리 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">로그인 실패</div>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다.</p>
        </div>
      </div>
    );
  }

  return null;
} 