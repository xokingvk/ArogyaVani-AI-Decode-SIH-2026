import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { UserProfile, AuthResult, AuthContextType } from '../types/authTypes';
import {
  getCurrentSession,
  getUserProfile,
  extractProfileFromUser,
  signInExistingUser,
  signUpNewUser,
  signOutCurrentUser,
  subscribeToAuthState,
} from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const session = await getCurrentSession();
        if (session?.user && isMounted) {
          let profile = await getUserProfile(session.user.id);
          if (!profile && session.user) {
            profile = extractProfileFromUser(session.user);
          }
          if (isMounted) {
            setCurrentUser(profile);
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth session:', err);
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    initializeAuth();

    const { unsubscribe } = subscribeToAuthState((profile) => {
      if (isMounted) {
        setCurrentUser(profile);
        setIsAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loginUser = async (username: string, password: string): Promise<AuthResult> => {
    const result = await signInExistingUser(username, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
    return result;
  };

  const signupUser = async (
    username: string,
    password: string,
    villageDistrict: string
  ): Promise<AuthResult> => {
    const result = await signUpNewUser(username, password, villageDistrict);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
    return result;
  };

  const logoutUser = async (): Promise<void> => {
    await signOutCurrentUser();
    setCurrentUser(null);
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const session = await getCurrentSession();
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        setCurrentUser(profile);
      } else {
        const profile = await getUserProfile('demo');
        if (profile) {
          setCurrentUser(profile);
        }
      }
    } catch (err) {
      console.error('Error refreshing user profile:', err);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      isLoggedIn: Boolean(currentUser),
      isAuthLoading,
      loginUser,
      signupUser,
      logoutUser,
      refreshProfile,
    }),
    [currentUser, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
