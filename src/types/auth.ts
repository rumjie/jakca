export interface User {
  id: string;
  email?: string; // 소셜 로그인에서는 이메일이 없을 수 있음
  nickname: string;
  platform: 'web' | 'social' | 'google' | 'kakao';
  status: 'active' | 'inactive' | 'banned';
  email_verified_at?: string;
  created_at: string;
  // last_login_at은 DB에 없으므로 제거
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