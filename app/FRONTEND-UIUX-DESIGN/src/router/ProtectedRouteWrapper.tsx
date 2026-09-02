import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FullScreenLoader } from '../components/common/FullScreenLoader';

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
  onRedirectToLogin?: () => void;
}

export const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = ({
  children,
  onRedirectToLogin,
}) => {
  const { isLoggedIn, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <FullScreenLoader message="Loading secure session..." />;
  }

  if (!isLoggedIn) {
    if (onRedirectToLogin) {
      onRedirectToLogin();
      return null;
    }
    // Return null or trigger redirect
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRouteWrapper;
