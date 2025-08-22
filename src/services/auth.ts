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
        console.error('Auth 사용자 정보 가져오기 실패:', error);
        return { user: null, error: { message: '인증에 실패했습니다.' } };
      }

      console.log('Auth 사용자 정보:', {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      });

      // users 테이블에 사용자 정보가 있는지 확인
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code === 'PGRST116') {
        console.log('새 사용자 생성 시작');
        // 사용자가 users 테이블에 없으면 새로 생성
        const result = await this.createUserFromAuth(user);
        return result;
      }

      if (userError) {
        console.error('기존 사용자 정보 조회 실패:', userError);
        return { user: null, error: { message: '사용자 정보를 가져올 수 없습니다.' } };
      }

      console.log('기존 사용자 정보 업데이트 시작');
      // 기존 사용자 정보 업데이트
      const result = await this.updateUserFromAuth(user, existingUser);
      return result;
    } catch (error) {
      console.error('Auth 콜백 처리 중 오류:', error);
      return { user: null, error: { message: '알 수 없는 오류가 발생했습니다.' } };
    }
  }

  // Auth 사용자 정보로 새 사용자 생성
  private static async createUserFromAuth(authUser: any): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      // 이메일이 없을 수 있으므로 처리
      const email = authUser.email || `${authUser.id}@social.local`;
      
      // 닉네임 추출 (다양한 소스에서 시도)
      const nickname = authUser.user_metadata?.full_name || 
                      authUser.user_metadata?.name || 
                      authUser.user_metadata?.nickname ||
                      authUser.user_metadata?.display_name ||
                      authUser.email?.split('@')[0] || 
                      '사용자';

      // 플랫폼 판별
      const platform = this.determinePlatform(authUser);

      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email: email,
          nickname: nickname,
          platform: platform,
          status: 'active',
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('사용자 생성 오류:', insertError);
        return { user: null, error: { message: '프로필 생성에 실패했습니다.' } };
      }

      // 새로 생성된 사용자 정보 반환
      const { data: newUser, error: newUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (newUserError) {
        console.error('생성된 사용자 정보 조회 실패:', newUserError);
        return { user: null, error: { message: '사용자 정보를 가져올 수 없습니다.' } };
      }

      console.log('생성된 사용자 정보:', newUser);
      return { user: newUser, error: null };
    } catch (error) {
      console.error('사용자 생성 중 예외 발생:', error);
      return { user: null, error: { message: '사용자 생성 중 오류가 발생했습니다.' } };
    }
  }

  // 기존 사용자 정보 업데이트
  private static async updateUserFromAuth(authUser: any, existingUser: User): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const updateData: Partial<User> = {};

      // 이메일 업데이트 (새로 받은 이메일이 있고, 기존과 다른 경우)
      if (authUser.email && authUser.email !== existingUser.email) {
        updateData.email = authUser.email;
      }

      // 닉네임 업데이트 (새로 받은 닉네임이 있고, 기존과 다른 경우)
      const newNickname = authUser.user_metadata?.full_name || 
                         authUser.user_metadata?.name || 
                         authUser.user_metadata?.nickname ||
                         authUser.user_metadata?.display_name;
      
      if (newNickname && newNickname !== existingUser.nickname) {
        updateData.nickname = newNickname;
      }

      // 플랫폼 업데이트 (필요한 경우)
      const platform = this.determinePlatform(authUser);
      if (platform !== existingUser.platform) {
        updateData.platform = platform;
      }

      // 업데이트할 데이터가 있는 경우에만 업데이트
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', authUser.id);

        if (updateError) {
          console.error('사용자 업데이트 오류:', updateError);
          // 업데이트 실패해도 기존 사용자 정보 반환
        }
      }

      // 업데이트된 사용자 정보 반환
      const { data: updatedUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError) {
        return { user: null, error: { message: '사용자 정보를 가져올 수 없습니다.' } };
      }

      return { user: updatedUser, error: null };
    } catch (error) {
      console.error('사용자 업데이트 중 오류:', error);
      return { user: null, error: { message: '사용자 업데이트 중 오류가 발생했습니다.' } };
    }
  }

  // 플랫폼 판별 로직
  private static determinePlatform(authUser: any): 'google' | 'kakao' | 'social' {
    // Supabase Auth에서 제공하는 정보로 플랫폼 판별
    const provider = authUser.app_metadata?.provider;
    
    if (provider === 'google') return 'google';
    if (provider === 'kakao') return 'kakao';
    
    // 기본값
    return 'social';
  }

  // 회원가입 (이메일/비밀번호)
  static async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    // 임시 조치: 이메일/비밀번호 회원가입 비활성화
    return {
      user: null,
      error: { message: '현재는 구글/카카오 소셜 로그인으로만 회원가입이 가능합니다.' }
    };
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