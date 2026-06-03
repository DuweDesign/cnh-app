
export interface BonusStatusResponse {
  success: boolean;
  monthKey: string;
  countryIso?: 'DE' | 'AT' | null;
  winnerLimit?: number;
  myRank: number | null;
  myMonthBonusPoints: number;
  kickerFlag?: boolean;
  isTop10: boolean;
  pointsToTop10: number;
  isTop5?: boolean;
  pointsToTop5?: number;
  isTop15?: boolean;
  pointsToTop15?: number;
  thresholdPoints: number | null;
  top10Count: number;
  message: string;
}
