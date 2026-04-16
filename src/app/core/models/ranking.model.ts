export interface RankingUser {
  _id: string;
  dealernumber: string;
  firstname: string;
  surname: string;
  company: string;
  totalPoints: number;
  monthlyPoints?: {
    monthKey: string;
    points: number;
    bonuspoints: number;
    partpoints: number;
  }[];
  rank?: number;
  overallRank?: number;
  rankInOwnList?: number;
  teamRank?: number;
}

export interface SalesRankingResponse {
  success: boolean;
  ranking: RankingUser[];
}

export interface ManagementRankingResponse {
  success: boolean;
  ownSales: RankingUser[];
  top20: RankingUser[];
}

export interface MyTeamResponse {
  success: boolean;
  dealerGroupId: string;
  competition: string | null;
  total: number;
  team: RankingUser[];
}