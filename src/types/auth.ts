export interface User {
  id: string;
  email?: string; // 소셜 로그인에서는 이메일이 없을 수 있음
  nickname: string;
  platform: 'web' | 'social' | 'google' | 'kakao';
  status: 'active' | 'inactive' | 'banned';
  profile_image?: string;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  nickname: string;
  platform: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
}