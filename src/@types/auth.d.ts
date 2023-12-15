export type loginUserType = {
  email: string;
  password: string;
}

export type registerUserType = {
  user_name: string;
  password: string;
  email: string;
}

export type userInfoType = {
  created_at: string;
  email?: string | undefined;
  id?: string | undefined;
  phone?: string | undefined;
  updated_at?: string | undefined;
  user_metadata?: any;
}

export type sessionObjType = {
  access_token: string;
  expires_at?: number | undefined;
  expires_in: number | undefined;
  refresh_token: string;
  token_type: string;
}
