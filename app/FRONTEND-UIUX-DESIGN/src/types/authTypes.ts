export interface UserProfile {
  id: string;
  username: string;
  village_district?: string;
  preferred_language?: string;
  created_at?: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  errorMessage?: string;
  errorType?: 'USER_NOT_FOUND' | 'INVALID_CREDENTIALS' | 'USERNAME_TAKEN' | 'GENERIC_ERROR';
}

export interface AuthContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  loginUser: (username: string, password: string) => Promise<AuthResult>;
  signupUser: (username: string, password: string, villageDistrict: string) => Promise<AuthResult>;
  logoutUser: () => Promise<void>;
}

