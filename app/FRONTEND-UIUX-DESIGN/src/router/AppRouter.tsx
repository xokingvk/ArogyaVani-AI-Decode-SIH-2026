import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { DashboardHomeScreen } from '../screens/dashboard/DashboardHomeScreen';
import { MoreOverviewScreen } from '../screens/dashboard/MoreOverviewScreen';
import { GovernmentSchemesScreen } from '../screens/schemes/GovernmentSchemesScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ProtectedRouteWrapper } from './ProtectedRouteWrapper';
import { FullScreenLoader } from '../components/common/FullScreenLoader';
import { BottomNavigationBar, BottomTab } from '../components/layout/BottomNavigationBar';
import { TopHeaderBar } from '../components/layout/TopHeaderBar';
import { AndroidFrameWrapper } from '../components/layout/AndroidFrameWrapper';
import { EmergencySosModal } from '../components/emergency/EmergencySosModal';
import { NotificationsModal } from '../components/notifications/NotificationsModal';

export type AppRoute = '/login' | '/signup' | '/dashboard' | '/settings' | '/profile';

export const AppRouter: React.FC = () => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('/login');
  const [activeTab, setActiveTab] = useState<BottomTab>('home');
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Sync route with authentication state
  useEffect(() => {
    if (!isAuthLoading) {
      if (isLoggedIn) {
        if (currentRoute === '/login' || currentRoute === '/signup') {
          setCurrentRoute('/dashboard');
          setActiveTab('home');
        }
      } else {
        if (currentRoute !== '/login' && currentRoute !== '/signup') {
          setCurrentRoute('/login');
        }
      }
    }
  }, [isLoggedIn, isAuthLoading, currentRoute]);

  if (isAuthLoading) {
    return <FullScreenLoader message="Checking authentication session..." />;
  }

  // ── PUBLIC ROUTES ─────────────────────────────────────────────────────────

  if (currentRoute === '/signup') {
    return (
      <AndroidFrameWrapper>
        <SignupScreen
          onNavigateToLogin={() => setCurrentRoute('/login')}
          onSignupSuccess={() => {
            setCurrentRoute('/dashboard');
            setActiveTab('home');
          }}
        />
      </AndroidFrameWrapper>
    );
  }

  if (currentRoute === '/login' && !isLoggedIn) {
    return (
      <AndroidFrameWrapper>
        <LoginScreen
          onNavigateToSignup={() => setCurrentRoute('/signup')}
          onLoginSuccess={() => {
            setCurrentRoute('/dashboard');
            setActiveTab('home');
          }}
        />
      </AndroidFrameWrapper>
    );
  }

  // ── PROTECTED: PROFILE ────────────────────────────────────────────────────

  if (currentRoute === '/profile') {
    return (
      <AndroidFrameWrapper>
        <ProtectedRouteWrapper onRedirectToLogin={() => setCurrentRoute('/login')}>
          <ProfileScreen
            onNavigateBack={() => setCurrentRoute('/dashboard')}
            onLoggedOut={() => setCurrentRoute('/login')}
          />
        </ProtectedRouteWrapper>
      </AndroidFrameWrapper>
    );
  }

  // ── PROTECTED: SETTINGS (no bottom nav) ───────────────────────────────────

  if (currentRoute === '/settings') {
    return (
      <AndroidFrameWrapper>
        <ProtectedRouteWrapper onRedirectToLogin={() => setCurrentRoute('/login')}>
          <SettingsScreen
            onNavigateBack={() => setCurrentRoute('/dashboard')}
            onLoggedOut={() => setCurrentRoute('/login')}
          />
        </ProtectedRouteWrapper>
      </AndroidFrameWrapper>
    );
  }

  // ── PROTECTED: TABBED SCREENS (Home, Schemes, History, More) ─────────────

  const handleTabChange = (tab: BottomTab) => {
    setActiveTab(tab);
  };

  const renderTabScreen = () => {
    switch (activeTab) {
      case 'schemes':
        return <GovernmentSchemesScreen />;
      case 'history':
        return (
          <DashboardHomeScreen
            onNavigateToSettings={() => setCurrentRoute('/settings')}
            onNavigateToEmergencySos={() => setIsSosOpen(true)}
          />
        );
      case 'more':
        return (
          <MoreOverviewScreen
            onNavigateToSettings={() => setCurrentRoute('/settings')}
            onLoggedOut={() => setCurrentRoute('/login')}
          />
        );
      case 'home':
      default:
        return <HomeScreen onNavigateToSchemes={() => handleTabChange('schemes')} />;
    }
  };

  return (
    <AndroidFrameWrapper>
      <ProtectedRouteWrapper onRedirectToLogin={() => setCurrentRoute('/login')}>
        <div className="h-full w-full bg-slate-50 overflow-hidden relative flex flex-col">
          
          {/* Fixed Top Header (Shared across all 4 tabs) */}
          <TopHeaderBar
            onNotificationsClick={() => setIsNotificationsOpen(true)}
            onAvatarClick={() => setCurrentRoute('/profile')}
          />

          {/* Scrollable Page Content Area between Top and Bottom Bars */}
          <main className="flex-1 overflow-y-auto bg-white pt-0 pb-0 w-full relative flex flex-col overscroll-y-contain">
            {renderTabScreen()}
          </main>

          {/* Fixed Bottom Navigation (Home | Schemes | History | More) */}
          <BottomNavigationBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* Emergency SOS Interactive Overlay */}
          <EmergencySosModal
            isOpen={isSosOpen}
            onClose={() => setIsSosOpen(false)}
          />

          {/* Notifications Modal */}
          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />

        </div>
      </ProtectedRouteWrapper>
    </AndroidFrameWrapper>
  );
};

export default AppRouter;
