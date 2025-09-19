export type UserData = {
  email: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: UserData;
  created: boolean;
};

export type AuthUrlResponse = {
  auth_url: string;
  success: boolean;
};
