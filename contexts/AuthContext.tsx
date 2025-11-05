import { useEffect, useState, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface AuthState {
  userId: string | null;
  username: string | null;
  token: string | null;
  isLoading: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    userId: null,
    username: null,
    token: null,
    isLoading: true,
  });

  const loadAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userId = await AsyncStorage.getItem('auth_userId');
      const username = await AsyncStorage.getItem('auth_username');
      
      if (token && userId && username) {
        setState({
          userId,
          username,
          token,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  const login = useCallback(async (userId: string, username: string, token: string) => {
    try {
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_userId', userId);
      await AsyncStorage.setItem('auth_username', username);
      
      setState({
        userId,
        username,
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to save auth:', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_userId');
      await AsyncStorage.removeItem('auth_username');
      
      setState({
        userId: null,
        username: null,
        token: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }, []);

  return useMemo(() => ({
    ...state,
    login,
    logout,
    isAuthenticated: !!state.token,
  }), [state, login, logout]);
});
