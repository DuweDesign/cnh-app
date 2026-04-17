export type UserRole =
  | 'sysadmin'
  | 'vipp-admin'
  | 'cnh-admin'
  | 'cnh-sales'
  | 'cnh-management';

export type CompetitionType =
  | 'case-steyr'
  | 'new-holland'
  | null;

export interface MonthlyPoints {
  monthKey: string;
  points: number;
  bonuspoints: number;
  partpoints: number;
}

export interface Profile {
  _id: string;
  email: string;
  dealernumber: string;

  salutation: string;
  firstname: string;
  surname: string;
  greeting_formular: string;
  company: string;

  role: UserRole;
  competition: CompetitionType;

  dealerGroupId: string;

  totalPoints: number;
  monthlyPoints: MonthlyPoints[];

  isRegistered: boolean;
  passwordSetAt: string | null;

  active: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface MyProfile extends Profile {
  rank: number | null;
  isTop10: boolean;
  pointsToTop10: number | null;
}

export interface UpdateProfilePayload {
  firstname: string;
  surname: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}