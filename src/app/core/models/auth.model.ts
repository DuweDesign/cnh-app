export const USER_ROLES = {
  SYSADMIN: 'sysadmin',
  VIPP_ADMIN: 'vipp-admin',
  CNH_ADMIN: 'cnh-admin',
  WAREHOUSE_ADMIN: 'warehouse-admin',
  CNH_SALES: 'cnh-sales',
  CNH_MANAGEMENT: 'cnh-management',
  CNH_WAREHOUSE: 'cnh-warehouse'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const COMPETITIONS = {
  CASE_STEYR: 'case-steyr',
  NEW_HOLLAND: 'new-holland',
  WAREHOUSE: 'warehouse'
} as const;

export type  CompetitionType = typeof COMPETITIONS[keyof typeof COMPETITIONS];

export interface AuthUser {
  _id: string;
  email: string;
  dealernumber: string;
  dealerGroupId: string;
  role: UserRole;
  firstname?: string;
  surname?: string;
  competition?: CompetitionType | null;
}

export interface LoginPayload {
  dealernumber: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: AuthUser;
}

export interface MeResponse {
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