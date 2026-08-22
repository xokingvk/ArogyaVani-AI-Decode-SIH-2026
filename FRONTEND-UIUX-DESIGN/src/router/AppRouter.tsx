import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { DashboardHomeScreen } from '../screens/dashboard/DashboardHomeScreen';
import { MoreOverviewScreen } from '../screens/dashboard/MoreOverviewScreen';
import { GovernmentSchemesScreen } from '../screens/schemes/GovernmentSchemesScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ProtectedRouteWrapper } from './ProtectedRouteWrapper';
import { FullScreenLoader } from '../components/common/FullScreenLoader';
import { BottomNavigationBar, BottomTab } from '../components/layout/BottomNavigationBar';
import { TopHeaderBar } from '../components/layout/TopHeaderBar';

export type AppRoute = '/login' | '/signup' | '/dashboard' | '/settings';

export const AppRouter: React.FC = () => {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('/login');
  const [activeTab, setActiveTab] = useState<BottomTab>('home');

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
  }, [isLoggedIn, isAuthLoading]);

  if (isAuthLoading) {
    return <FullScreenLoader message="Checking authentication session..." />;
  }

  // ── PUBLIC ROUTES ─────────────────────────────────────────────────────────

  if (currentRoute === '/signup') {
    return (
      <SignupScreen
        onNavigateToLogin={() => setCurrentRoute('/login')}
        onSignupSuccess={() => {
          setCurrentRoute('/dashboard');
          setActiveTab('home');
        }}
      />
    );
  }

  if (currentRoute === '/login' && !isLoggedIn) {
    return (
      <LoginScreen
        onNavigateToSignup={() => setCurrentRoute('/signup')}
        onLoginSuccess={() => {
          setCurrentRoute('/dashboard');
          setActiveTab('home');
        }}
      />
    );
  }

  // ── PROTECTED: SETTINGS (no bottom nav) ───────────────────────────────────

  if (currentRoute === '/settings') {
    return (
      <ProtectedRouteWrapper onRedirectToLogin={() => setCurrentRoute('/login')}>
        <SettingsScreen
          onNavigateBack={() => setCurrentRoute('/dashboard')}
          onLoggedOut={() => setCurrentRoute('/login')}
        />
      </ProtectedRouteWrapper>
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
            onNavigateToEmergencySos={() => {
              alert('Emergency SOS triggered');
            }}
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
    <ProtectedRouteWrapper onRedirectToLogin={() => setCurrentRoute('/login')}>
      <div className="h-screen h-[100dvh] w-full bg-slate-50 overflow-hidden relative flex flex-col">
        {/* Fixed Top Header (Shared across all 4 tabs) */}
        <TopHeaderBar
          onMenuClick={() => console.log('Menu clicked')}
          onNotificationsClick={() => console.log('Notifications clicked')}
          onAvatarClick={() => setCurrentRoute('/settings')}
        />

        {/* Scrollable Page Content Area between Top and Bottom Bars */}
        <main className="flex-1 overflow-y-auto bg-white pt-[58px] pb-[72px] w-full relative flex flex-col overscroll-y-contain">
          {renderTabScreen()}
        </main>

        {/* Fixed Bottom Navigation (Home | Schemes | History | More) */}
        <BottomNavigationBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </ProtectedRouteWrapper>
  );
};

export default AppRouter;
