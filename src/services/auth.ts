import { supabase } from '@/lib/supabaseClient';
import type { SignUpData, SignInData, User, AuthError } from '@/types/auth';

export class AuthService {
  // 소셜 로그인 (Google, Kakao)
  static async signInWithProvider(provider: 'google' | 'kakao') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.name } };
      }

      return { user: null, error: null }; // OAuth는 리다이렉트되므로 여기서는 null 반환
    } catch (error) {
      return { user: null, error: { message: '소셜 로그인 중 오류가 발생했습니다.' } };
    }
  }

  // 소셜 로그인 콜백 처리
  static async handleAuthCallback() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { user: null, error: { message: '인증에 실패했습니다.' } };
      }

      // users 테이블에 사용자 정보가 있는지 확인
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code === 'PGRST116') {
        // 사용자가 users 테이블에 없으면 추가
        // 이메일이 없을 수 있으므로 처리
        const email = user.email || `${user.id}@social.local`;
        const nickname = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.user_metadata?.nickname ||
                        user.email?.split('@')[0] || 
                        '사용자';

        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: email,
            nickname: nickname,
            platform: 'social',
            email_verified_at: user.email_confirmed_at
          }]);

        if (insertError) {
          return { user: null, error: { message: '프로필 생성에 실패했습니다.' } };
        }

        // 새로 생성된 사용자 정보 반환
        const { data: newUser, error: newUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (newUserError) {
          return { user: null, error: { message: '사용자 정보를 가져올 수 없습니다.' } };
        }

        return { user: newUser, error: null };
      }

      if (userError) {
        return { user: null, error: { message: '사용자 정보를 가져올 수 없습니다.' } };
      }

      return { user: existingUser, error: null };
    } catch (error) {
      return { user: null, error: { message: '알 수 없는 오류가 발생했습니다.' } };
    }
  }

  // 회원가입 (이메일/비밀번호)
  static async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      // 1. Supabase Auth로 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { user: null, error: { message: authError.message, code: authError.name } };
      }

      if (!authData.user) {
        return { user: null, error: { message: '회원가입에 실패했습니다.' } };
      }

      // 2. users 테이블에 추가 정보 저장
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: authData.user.email,
          nickname: data.nickname,
          platform: data.platform,
          email_verified_at: authData.user.email_confirmed_at
        }]);

      if (profileError) {
        // users 테이블 저장 실패 시 auth 계정도 삭제
        await supabase.auth.signOut();
        return { user: null, error: { message: '프로필 생성에 실패했습니다.' } };
      }

      // 3. 생성된 사용자 정보 반환
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        return { user: null, error: { message: '사용자 정보를 가져올 수 없습니다.' } };
      }

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: { message: '알 수 없는 오류가 발생했습니다.' } };
    }
  }

  // 로그인 (이메일/비밀번호)
  static async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { user: null, error: { message: authError.message, code: authError.name } };
      }

      if (!authData.user) {
        return { user: null, error: { message: '로그인에 실패했습니다.' } };
      }

      // users 테이블에서 사용자 정보 가져오기
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        return { user: null, error: { message: '사용자 정보를 가져올 수 없습니다.' } };
      }

      // last_login_at 업데이트
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', authData.user.id);

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: { message: '알 수 없는 오류가 발생했습니다.' } };
    }
  }

  // 로그아웃
  static async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? { message: error.message } : null };
    } catch (error) {
      return { error: { message: '로그아웃 중 오류가 발생했습니다.' } };
    }
  }

  // 현재 사용자 정보 가져오기
  static async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return { user: null, error: null }; // 로그인되지 않은 상태
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        return { user: null, error: { message: '사용자 정보를 가져올 수 없습니다.' } };
      }

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: { message: '알 수 없는 오류가 발생했습니다.' } };
    }
  }

  // 세션 상태 확인
  static async getSession(): Promise<{ session: any | null; error: AuthError | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error: error ? { message: error.message } : null };
    } catch (error) {
      return { session: null, error: { message: '세션을 가져올 수 없습니다.' } };
    }
  }
}