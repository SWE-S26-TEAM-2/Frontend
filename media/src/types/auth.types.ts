

export interface ILoginRequest {
  emailOrProfileUrl: string;
  password: string;
}

export interface IRegisterStepProps {
  emailOrProfileUrl: string;
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onBack: () => void;
  error: string;
  isLoading: boolean;
  onCaptchaChange: (token: string | null) => void;
}
export interface ISignInStepProps {
  emailOrProfileUrl: string;
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onBack: () => void;
  error: string;
  isLoading: boolean;
}
export interface IInputStepProps {
  emailOrProfileUrl: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onBack: () => void;
  error: string;
  isLoading: boolean;
}
export interface IRegisterRequest {
  emailOrProfileUrl: string;
  password: string;
}

export interface IRegisterResponse {
  success: boolean;
  token: string;
  user: IUser;
}

export interface ICheckEmailResponse {
  isExisting: boolean;
}

export interface IUser {
  id: string | number;
  username: string;
  email?: string;
  profileImageUrl?: string;
  createdAt?: string;
}

export interface ILoginResponse {
  success: boolean;
  token: string;
  user: IUser;
}

export interface IAuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  login: (user: IUser, token: string) => void;
  logout: () => void;
}
