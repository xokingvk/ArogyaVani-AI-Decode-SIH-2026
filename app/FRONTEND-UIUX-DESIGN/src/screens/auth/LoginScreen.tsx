import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HeartHandshake, User, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageToggleSelector } from '../../components/common/LanguageToggleSelector';
import ruralIllustrationImage from '../../assets/illustrations/rural-health-assistant.jpg';

interface LoginScreenProps {
  onNavigateToSignup?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToSignup,
  onLoginSuccess,
}) => {
  const { t } = useTranslation();
  const { loginUser } = useAuth();

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error States
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  // Client-side validation before submit
  const validateForm = (): boolean => {
    let isValid = true;
    setUsernameError(null);
    setPasswordError(null);
    setGenericError(null);

    const cleanUsername = username.trim().toLowerCase();

    // 1. Username validation
    if (!cleanUsername) {
      setUsernameError(t('auth.validation.usernameRequired'));
      isValid = false;
    } else if (/\s/.test(cleanUsername) || cleanUsername !== username.trim()) {
      setUsernameError(t('auth.validation.usernameFormat'));
      isValid = false;
    }

    // 2. Password validation
    if (!password) {
      setPasswordError(t('auth.validation.passwordRequired'));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t('auth.validation.passwordMinLength'));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setGenericError(null);

    try {
      // Calls signInExistingUser from authService via AuthContext
      const result = await loginUser(username, password);

      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // Show error banner with exact error message from signInExistingUser()
        setGenericError(result.errorMessage || 'Incorrect username or password');
      }
    } catch (err: any) {
      setGenericError(err?.message || 'Incorrect username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="flex-1 min-h-0 overflow-y-auto w-full bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-8 md:py-12 select-none"
      id="login-screen-container"
    >
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">

        {/* 1. TOP SECTION: Circular icon badge with HeartHandshake icon */}
        <header className="flex flex-col items-center text-center mb-3">
          <div
            id="brand-icon-badge"
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-[#0D9488] via-[#0F766E] to-[#10B981] text-white flex items-center justify-center shadow-lg shadow-teal-700/20 mb-3 transform hover:scale-105 transition-transform duration-300 ring-4 ring-white"
          >
            <HeartHandshake className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow" strokeWidth={2.2} />
          </div>

          {/* 2. APP TITLE: "ArogyaVani AI" in bold, large, dark navy text */}
          <h1
            id="app-title"
            className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight leading-tight"
          >
            {t('app.title')}
          </h1>

          {/* 3. TAGLINE: "Your Rural Health Voice Assistant" in smaller gray text */}
          <p
            id="app-tagline"
            className="text-sm sm:text-base text-slate-500 font-medium mt-1"
          >
            {t('app.tagline')}
          </p>
        </header>

        {/* 4. ILLUSTRATION: Rural Indian man speaking into phone with sound waves & village hut */}
        <section
          id="illustration-section"
          className="w-full my-2 flex justify-center items-center"
          aria-label="Illustration of rural health voice assistant in action"
        >
          <div className="relative w-full max-w-[270px] sm:max-w-[300px] aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex items-center justify-center bg-amber-50/40">
            <img
              src={ruralIllustrationImage}
              alt="Rural Health Voice Assistant"
              className="w-full h-full object-cover select-none pointer-events-none"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </section>

        {/* Error Banner with exact error message from signInExistingUser() */}
        {genericError && (
          <div
            id="login-error-banner"
            role="alert"
            className="w-full mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs sm:text-sm text-[#B33A3A] animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 text-[#B33A3A] shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{genericError}</span>
          </div>
        )}

        {/* 5-7. FORM: Username, Password, and "Get Started" / "Sign In" Button */}
        <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>

          {/* Username Input */}
          <div className="flex flex-col space-y-1">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/\s/g, ''));
                  if (usernameError) setUsernameError(null);
                  if (genericError) setGenericError(null);
                }}
                placeholder={t('auth.usernamePlaceholder')}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                disabled={isSubmitting}
                className={`w-full pl-11 pr-4 py-3.5 bg-white rounded-xl border text-sm sm:text-base text-slate-800 placeholder-slate-400 font-normal transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 ${usernameError
                    ? 'border-[#B33A3A] focus:ring-[#B33A3A]/20 focus:border-[#B33A3A]'
                    : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20 hover:border-slate-300'
                  }`}
              />
            </div>
            {usernameError && (
              <p
                id="username-error-text"
                role="alert"
                className="text-xs sm:text-sm text-[#B33A3A] font-medium pl-1.5 pt-0.5 flex items-center gap-1"
              >
                <span>•</span> {usernameError}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col space-y-1">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                  if (genericError) setGenericError(null);
                }}
                placeholder={t('auth.passwordPlaceholder')}
                disabled={isSubmitting}
                className={`w-full pl-11 pr-11 py-3.5 bg-white rounded-xl border text-sm sm:text-base text-slate-800 placeholder-slate-400 font-normal transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 ${passwordError
                    ? 'border-[#B33A3A] focus:ring-[#B33A3A]/20 focus:border-[#B33A3A]'
                    : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20 hover:border-slate-300'
                  }`}
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/30 rounded cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-slate-500" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p
                id="password-error-text"
                role="alert"
                className="text-xs sm:text-sm text-[#B33A3A] font-medium pl-1.5 pt-0.5 flex items-center gap-1"
              >
                <span>•</span> {passwordError}
              </p>
            )}
          </div>

          {/* "Get Started" / "Sign In" Button */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#16324F] hover:bg-[#10253B] active:scale-[0.99] text-white font-bold text-base shadow-md shadow-slate-900/15 transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#16324F] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white/90" />
                <span>{t('auth.getStarted')}...</span>
              </>
            ) : (
              <span>{t('auth.getStarted')}</span>
            )}
          </button>
        </form>

        {/* 8. LANGUAGE SELECTOR */}
        <div id="language-selector-section" className="mt-5 flex flex-col items-center">
          <LanguageToggleSelector variant="pills" />
        </div>

        {/* 9. Link to signup */}
        <div id="signup-link-section" className="mt-5 text-center">
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            <span>{t('auth.newUserPrompt')}</span>
            <button
              type="button"
              id="create-account-link"
              onClick={() => onNavigateToSignup?.()}
              className="text-[#16324F] font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500/40 rounded transition-colors cursor-pointer"
            >
              {t('auth.createAccount')}
            </button>
          </p>
        </div>

      </div>
    </main>
  );
};

export default LoginScreen;
