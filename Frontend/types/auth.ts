export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};
