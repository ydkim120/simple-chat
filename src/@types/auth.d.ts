export type loginUserType = {
  email: string
  password: string
}

export type registerUserType = {
  user_name: string
  password: string
  email: string
  user_photo: File | null
}

export type userInfoType = {
  created_at: string
  email?: string | undefined
  id?: string | undefined
  phone?: string | undefined
  updated_at?: string | undefined
  user_metadata?: any
  photo?: string | null
}

export type profileType = {
  id: string | undefined
  user_email: string | undefined
  user_name?: string | undefined
  user_photo?: string | undefined
  created_at?: string
  updated_at?: string | undefined
  
  leaved_at?: date | undefined
}

export type sessionObjType = {
  access_token: string
  expires_at?: number | undefined
  expires_in: number | undefined
  refresh_token: string
  token_type: string
}
