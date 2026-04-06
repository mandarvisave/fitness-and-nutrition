export type AppLanguage = "en" | "hi";
export type SubscriptionTier = "free" | "core" | "premium";
export type MemberRole = "parent" | "child" | "senior";
export type MemberGoal = "weight_loss" | "muscle_gain" | "general_fitness" | "energy_boost" | "body_recomposition";
export type WorkoutTrack =
  | "weight-loss"
  | "muscle-gain"
  | "general-fitness"
  | "energy-boost"
  | "body-recomposition"
  | "family-fit"
  | "morning-routine"
  | "seniors";
export type MemberGender = "male" | "female" | "other";
export type BodyProfile =
  | "lean-build"
  | "balanced-build"
  | "fat-loss-priority"
  | "muscle-gain-priority"
  | "recomposition-candidate"
  | "mobility-first";

export interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  familyName: string;
  language: AppLanguage;
  reminderTime: string;
}

export interface NotificationSettings {
  mealReminders: boolean;
  workoutReminders: boolean;
  waterReminders: boolean;
  weeklyReportEmails: boolean;
  aiHindiNudges: boolean;
}

export interface HouseholdSettings {
  familyChallengeEnabled: boolean;
  festivalModeDefault: boolean;
  weekendSyncChallenge: boolean;
  conditionSpecificSuggestions: boolean;
}

export interface MemberGoalSettings {
  id: string;
  name: string;
  role: MemberRole;
  gender: MemberGender;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct: number | null;
  targetWeightKg: number | null;
  targetTimelineWeeks: number;
  bodyProfile: BodyProfile;
  goal: MemberGoal;
  calorieTarget: number;
  proteinTarget: number;
  hydrationTarget: number;
  workoutTrack: WorkoutTrack;
  focusHabit: string;
}

export interface SubscriptionSettings {
  tier: SubscriptionTier;
  billingCycle: "monthly";
  autoRenew: boolean;
  nextBillingDate: string;
  amountInr: number;
  paymentMethod: string;
  invoiceEmail: string;
}

export interface SettingsState {
  profile: ProfileSettings;
  notifications: NotificationSettings;
  household: HouseholdSettings;
  memberGoals: MemberGoalSettings[];
  subscription: SubscriptionSettings;
}
