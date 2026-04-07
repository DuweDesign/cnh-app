export const USER_ROLES = {
  SYSADMIN: 'sysadmin',
  VIPP_ADMIN: 'vipp-admin',
  CNH_ADMIN: 'cnh-admin',
  CNH_SALES: 'cnh-sales',
  CNH_MANAGEMENT: 'cnh-management'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const COMPETITIONS = {
  CASE_STEYR: 'case-steyr',
  NEW_HOLLAND: 'new-holland'
} as const;

export type  CompetitionType = typeof COMPETITIONS[keyof typeof COMPETITIONS];

export interface AuthUser {
  _id: string;
  email: string;
  dealernumber: string;
  firstname?: string;
  surname?: string;
  role: UserRole;
  competition?: CompetitionType | null;
}

export interface LoginPayload {
  dealernumber: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: AuthUser;
}

export interface ForgotPasswordPayload {
  dealernumber: string;
  email: string;
}

export interface RegisterRequestPayload {
  dealernumber: string;
  email: string;
}

export interface SetPasswordPayload {
  token: string;
  password: string;
}