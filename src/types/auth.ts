export type UserData = {
  email: string;
  first_name: string;
  last_name: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: UserData;
  created: boolean;
};

export type GoogleAuthUrlResponse = {
  auth_url: string;
  success: boolean;
};
