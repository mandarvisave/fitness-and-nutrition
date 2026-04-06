export interface ScoreBreakdown {
  nutrition: number;
  activity: number;
  consistency: number;
  sleep: number;
  hydration: number;
  mental: number;
  familySync?: number;
}

export interface BadgeAward {
  id: string;
  name: string;
  description: string;
}
