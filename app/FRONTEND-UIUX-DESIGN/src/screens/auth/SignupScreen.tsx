import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HeartHandshake, User, Lock, MapPin, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageToggleSelector } from '../../components/common/LanguageToggleSelector';

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  onSignupSuccess?: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onNavigateToLogin,
  onSignupSuccess,
}) => {
  const { t } = useTranslation();
  const { signupUser } = useAuth();

  // Form states
  const [username, setUsername] = useState('');
  const [villageDistrict, setVillageDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field validation errors
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [villageDistrictError, setVillageDistrictError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    setUsernameError(null);
    setVillageDistrictError(null);
    setPasswordError(null);
    setConfirmError(null);
    setGenericError(null);

    // 1. Username required, lowercase, no spaces
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setUsernameError(t('auth.validation.usernameRequired'));
      isValid = false;
    } else if (/\s/.test(cleanUsername) || cleanUsername !== username.trim()) {
      setUsernameError(t('auth.validation.usernameFormat'));
      isValid = false;
    }

    // 2. Village / District required
    if (!villageDistrict.trim()) {
      setVillageDistrictError(t('auth.validation.villageDistrictRequired'));
      isValid = false;
    }

    // 3. Password required, min 6 chars
    if (!password) {
      setPasswordError(t('auth.validation.passwordRequired'));
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(t('auth.validation.passwordMinLength'));
      isValid = false;
    }

    // 4. Confirm password match
    if (!confirmPassword) {
      setConfirmError(t('auth.validation.passwordRequired'));
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError(t('auth.validation.passwordsDoNotMatch'));
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGenericError(null);

    try {
      // Username is used as the login handle; village_district captures location
      const res = await signupUser(username, password, villageDistrict);

      if (res.success) {
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      } else {
        setGenericError(res.errorMessage || t('auth.errors.signupGenericError'));
      }
    } catch (err: any) {
      setGenericError(err?.message || t('auth.errors.signupGenericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="flex-1 min-h-0 overflow-y-auto w-full bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-8 md:py-12 select-none"
      id="signup-screen-container"
    >
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center">

        {/* Top Navigation Row */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            type="button"
            id="back-to-login-btn"
            onClick={onNavigateToLogin}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('auth.signInLink')}</span>
          </button>
          <LanguageToggleSelector variant="pills" />
        </div>

        {/* Brand Header */}
        <header className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#0D9488] via-[#0F766E] to-[#10B981] text-white flex items-center justify-center shadow-lg shadow-teal-700/20 mb-3 ring-4 ring-white">
            <HeartHandshake className="w-8 h-8" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tracking-tight">
            {t('auth.signupTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {t('app.tagline')}
          </p>
        </header>

        {/* Generic Error Banner */}
        {genericError && (
          <div
            role="alert"
            className="w-full mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs sm:text-sm text-[#B33A3A] animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 text-[#B33A3A] shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{genericError}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="w-full space-y-3.5" noValidate>

          {/* 1. Username Input */}
          <div className="flex flex-col space-y-1">
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="signup-username-input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/\s/g, ''));
                  if (usernameError) setUsernameError(null);
                }}
                placeholder={t('auth.usernamePlaceholder')}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                disabled={isSubmitting}
                className={`w-full pl-11 pr-4 py-3 bg-white rounded-xl border text-sm text-slate-800 placeholder-slate-400 font-normal transition-all shadow-sm focus:outline-none focus:ring-2 ${
                  usernameError
                    ? 'border-[#B33A3A] focus:ring-[#B33A3A]/20'
                    : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400 pl-1.5 font-normal">
              lowercase, no spaces
            </p>
            {usernameError && (
              <p className="text-xs text-[#B33A3A] font-medium pl-1.5 pt-0.5 flex items-center gap-1">
                <span>•</span> {usernameError}
              </p>
            )}
          </div>

          {/* 2. Village/District Input */}
          <div className="flex flex-col space-y-1">
            <div className="relative flex items-center">
              <MapPin className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="signup-village-input"
                type="text"
                value={villageDistrict}
                onChange={(e) => {
                  setVillageDistrict(e.target.value);
                  if (villageDistrictError) setVillageDistrictError(null);
                }}
                placeholder={t('auth.locationPlaceholder')}
                disabled={isSubmitting}
                className={`w-full pl-11 pr-4 py-3 bg-white rounded-xl border text-sm text-slate-800 placeholder-slate-400 font-normal transition-all shadow-sm focus:outline-none focus:ring-2 ${
                  villageDistrictError
                    ? 'border-[#B33A3A] focus:ring-[#B33A3A]/20'
                    : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                }`}
              />
            </div>
            {villageDistrictError && (
              <p className="text-xs text-[#B33A3A] font-medium pl-1.5 pt-0.5 flex items-center gap-1">
                <span>•</span> {villageDistrictError}
              </p>
            )}
          </div>

          {/* 3. Password Input */}
          <div className="flex flex-col space-y-1">
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="signup-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder={t('auth.passwordPlaceholder')}
                disabled={isSubmitting}
                className={`w-full pl-11 pr-11 py-3 bg-white rounded-xl border text-sm text-slate-800 placeholder-slate-400 font-normal transition-all shadow-sm focus:outline-none focus:ring-2 ${
                  passwordError
                    ? 'border-[#B33A3A] focus:ring-[#B33A3A]/20'
                    : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-[#B33A3A] font-medium pl-1.5 pt-0.5 flex items-center gap-1">
                <span>•</span> {passwordError}
              </p>
            )}
          </div>

          {/* 4. Confirm Password Input */}
          <div className="flex flex-col space-y-1">
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                id="signup-confirm-password-input"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmError) setConfirmError(null);
                }}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                disabled={isSubmitting}
                className={`w-full pl-11 pr-4 py-3 bg-white rounded-xl border text-sm text-slate-800 placeholder-slate-400 font-normal transition-all shadow-sm focus:outline-none focus:ring-2 ${
                  confirmError
                    ? 'border-[#B33A3A] focus:ring-[#B33A3A]/20'
                    : 'border-slate-200 focus:border-teal-600 focus:ring-teal-500/20'
                }`}
              />
            </div>
            {confirmError && (
              <p className="text-xs text-[#B33A3A] font-medium pl-1.5 pt-0.5 flex items-center gap-1">
                <span>•</span> {confirmError}
              </p>
            )}
          </div>

          {/* "Create Account" Button */}
          <button
            id="signup-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3.5 px-6 rounded-xl bg-[#16324F] hover:bg-[#10253B] active:scale-[0.99] text-white font-bold text-base shadow-md shadow-slate-900/15 transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#16324F] focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white/90" />
                <span>{t('auth.registerButton')}...</span>
              </>
            ) : (
              <span>{t('auth.registerButton')}</span>
            )}
          </button>
        </form>

        {/* Link back to login */}
        <div className="mt-5 text-center">
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            <span>{t('auth.alreadyHaveAccount')}</span>
            <button
              type="button"
              id="goto-login-link"
              onClick={onNavigateToLogin}
              className="text-[#16324F] font-bold hover:underline ml-1 focus:outline-none focus:ring-2 focus:ring-teal-500/40 rounded transition-colors cursor-pointer"
            >
              {t('auth.signInLink')}
            </button>
          </p>
        </div>

      </div>
    </main>
  );
};

export default SignupScreen;
