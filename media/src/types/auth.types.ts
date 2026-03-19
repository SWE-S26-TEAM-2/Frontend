

export interface ILoginRequest {
  emailOrProfileUrl: string;
  password: string;
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
