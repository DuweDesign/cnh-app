
export interface BonusStatusResponse {
  success: boolean;
  monthKey: string;
  myRank: number | null;
  myMonthPoints: number;
  isTop10: boolean;
  pointsToTop10: number;
  thresholdPoints: number | null;
  top10Count: number;
  message: string;
}