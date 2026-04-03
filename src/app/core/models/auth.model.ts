export const USER_ROLES = {
  SYSADMIN: 'sysadmin',
  VIPP_ADMIN: 'vipp-admin',
  CNH_ADMIN: 'cnh-admin',
  CNH_SALES: 'cnh-sales',
  CNH_MANAGEMENT: 'cnh-management'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface AuthUser {
  _id: string;
  email: string;
  firstname?: string;
  surname?: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface RegisterRequestPayload {
  email: string;
}

export interface SetPasswordPayload {
  token: string;
  password: string;
}