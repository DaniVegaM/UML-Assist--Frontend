export type UserData = {
  email: string;
  username: string;
  provider: 'email' | 'google' | 'github';
};

export type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  user: UserData;
  success: boolean;
};

export type AuthUrlResponse = {
  auth_url: string;
  success: boolean;
};
