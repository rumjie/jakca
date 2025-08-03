import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 이미 로그인된 경우 홈으로 리다이렉트
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSwitchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  const handleAuthSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {mode === 'signin' ? (
          <SignInForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignUp={handleSwitchMode}
          />
        ) : (
          <SignUpForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignIn={handleSwitchMode}
          />
        )}
      </div>
    </div>
  );
} 