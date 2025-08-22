import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, signup, isLoading } = useAuth();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!isLogin) {
      if (!name) {
        toast({
          title: "입력 오류",
          description: "이름을 입력해주세요.",
          variant: "destructive"
        });
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: "입력 오류",
          description: "비밀번호가 일치하지 않습니다.",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      let success = false;
      if (isLogin) {
        success = await login(email, password);
      } else {
        success = await signup(email, password, name);
      }

      if (success) {
        toast({
          title: isLogin ? "로그인 성공" : "회원가입 성공",
          description: isLogin ? "환영합니다!" : "회원가입이 완료되었습니다.",
        });
        onClose();
        // 폼 초기화
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
      } else {
        toast({
          title: isLogin ? "로그인 실패" : "회원가입 실패",
          description: "다시 시도해주세요.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "알 수 없는 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {isLogin ? '로그인' : '회원가입'}
          </h2>
          <p className="text-gray-600 text-center mt-2">
            {isLogin ? 'JAKCA에 오신 것을 환영합니다' : '새 계정을 만들어 시작하세요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                이름
              </Label>
              <div className="relative mt-1">
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="pl-10"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              이메일
            </Label>
            <div className="relative mt-1">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="pl-10"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              비밀번호
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="pl-10"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {!isLogin && (
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                비밀번호 확인
              </Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="pl-10"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button
              onClick={toggleMode}
              className="ml-1 text-orange-500 hover:text-orange-600 font-medium"
            >
              {isLogin ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;