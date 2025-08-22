import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/services/auth';
import type { User, SignUpData, SignInData, AuthError } from '@/types/auth';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // 현재 사용자 정보 쿼리
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const { user, error } = await AuthService.getCurrentUser();
      if (error) throw new Error(error.message);
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // 세션 상태 쿼리
  const {
    data: session,
    isLoading: isLoadingSession
  } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { session, error } = await AuthService.getSession();
      if (error) throw new Error(error.message);
      return session;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 회원가입 뮤테이션
  const signUpMutation = useMutation({
    mutationFn: AuthService.signUp,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(['auth', 'user'], data.user);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: (error: AuthError) => {
      console.error('회원가입 실패:', error);
    }
  });

  // 로그인 뮤테이션
  const signInMutation = useMutation({
    mutationFn: AuthService.signIn,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(['auth', 'user'], data.user);
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
    onError: (error: AuthError) => {
      console.error('로그인 실패:', error);
    }
  });

  // 로그아웃 뮤테이션
  const signOutMutation = useMutation({
    mutationFn: AuthService.signOut,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.setQueryData(['auth', 'session'], null);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: AuthError) => {
      console.error('로그아웃 실패:', error);
    }
  });

  // 회원가입 함수
  const signUp = useCallback(async (data: SignUpData) => {
    return signUpMutation.mutateAsync(data);
  }, [signUpMutation]);

  // 로그인 함수
  const signIn = useCallback(async (data: SignInData) => {
    return signInMutation.mutateAsync(data);
  }, [signInMutation]);

  // 로그아웃 함수
  const signOut = useCallback(async () => {
    return signOutMutation.mutateAsync();
  }, [signOutMutation]);

  // 초기화 상태 관리
  useEffect(() => {
    if (!isLoadingUser && !isLoadingSession) {
      setIsInitialized(true);
    }
  }, [isLoadingUser, isLoadingSession]);

  return {
    // 상태
    user,
    session,
    isAuthenticated: !!user,
    isLoading: isLoadingUser || isLoadingSession,
    isInitialized,
    
    // 뮤테이션 상태
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    
    // 에러
    userError,
    signUpError: signUpMutation.error,
    signInError: signInMutation.error,
    signOutError: signOutMutation.error,
    
    // 함수
    signUp,
    signIn,
    signOut,
    refetchUser,
  };
}; 