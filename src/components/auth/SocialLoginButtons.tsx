import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AuthService } from '@/services/auth';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SocialLoginButtonsProps {
  onError?: (message: string) => void;
}

export default function SocialLoginButtons({ onError }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    try {
      setIsLoading(provider);
      const result = await AuthService.signInWithProvider(provider);
      
      if (result.error) {
        onError?.(result.error.message);
      }
      // OAuth는 리다이렉트되므로 여기서는 아무것도 하지 않음
    } catch (error) {
      onError?.('소셜 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            또는
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading !== null}
          className="w-full"
        >
          {isLoading === 'google' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Google로 계속하기
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSocialLogin('kakao')}
          disabled={isLoading !== null}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400"
        >
          {isLoading === 'kakao' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M12 3C6.48 3 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                fill="#FEE500"
              />
              <path
                d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                fill="#000000"
              />
            </svg>
          )}
          카카오로 계속하기
        </Button>
      </div>
    </div>
  );
} 