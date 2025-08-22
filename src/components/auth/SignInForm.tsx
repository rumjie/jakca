import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SocialLoginButtons from './SocialLoginButtons';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export default function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
  const [socialError, setSocialError] = useState<string | null>(null);

  const handleSocialError = (message: string) => {
    setSocialError(message);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          현재는 구글/카카오 소셜 로그인으로만 로그인이 가능합니다.
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

        {/* 회원가입 페이지로 이동 */}
        <div className="text-center mt-4">
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToSignUp}
            className="text-sm"
          >
            계정이 없으신가요? 회원가입하기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 