export interface UserRead {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_email_verified: boolean
  is_admin: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface LoginPayload {
  email: string
  password: string
}
