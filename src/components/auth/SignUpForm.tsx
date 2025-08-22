import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SocialLoginButtons from './SocialLoginButtons';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export default function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const [socialError, setSocialError] = useState<string | null>(null);

  const handleSocialError = (message: string) => {
    setSocialError(message);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
        <CardDescription className="text-center">
          현재는 구글/카카오 소셜 로그인으로만 회원가입이 가능합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 소셜 로그인 에러 메시지 */}
        {socialError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{socialError}</AlertDescription>
          </Alert>
        )}

        {/* 소셜 로그인 버튼 */}
        <SocialLoginButtons onError={handleSocialError} />

        {/* 로그인 페이지로 이동 */}
        <div className="text-center mt-4">
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToSignIn}
            className="text-sm"
          >
            이미 계정이 있으신가요? 로그인하기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 