import type { SettingsState } from "@/types/settings";

export const defaultSettings: SettingsState = {
  profile: {
    fullName: "FitFamily Demo User",
    email: "demo@fitfamilyindia.com",
    phone: "+91 98765 43210",
    city: "Bengaluru",
    familyName: "The Demo Family",
    language: "en",
    reminderTime: "07:00"
  },
  notifications: {
    mealReminders: true,
    workoutReminders: true,
    waterReminders: true,
    weeklyReportEmails: true,
    aiHindiNudges: false
  },
  household: {
    familyChallengeEnabled: true,
    festivalModeDefault: true,
    weekendSyncChallenge: true,
    conditionSpecificSuggestions: true
  },
  memberGoals: [
    {
      id: "member-1",
      name: "Aarav",
      role: "parent",
      gender: "male",
      age: 35,
      heightCm: 175,
      weightKg: 84,
      bodyFatPct: 28,
      targetWeightKg: 77,
      targetTimelineWeeks: 16,
      bodyProfile: "fat-loss-priority",
      goal: "weight_loss",
      calorieTarget: 1900,
      proteinTarget: 110,
      hydrationTarget: 2500,
      workoutTrack: "weight-loss",
      focusHabit: "Hit 8,000+ steps"
    },
    {
      id: "member-2",
      name: "Meera",
      role: "parent",
      gender: "female",
      age: 33,
      heightCm: 162,
      weightKg: 61,
      bodyFatPct: 24,
      targetWeightKg: null,
      targetTimelineWeeks: 10,
      bodyProfile: "recomposition-candidate",
      goal: "body_recomposition",
      calorieTarget: 1950,
      proteinTarget: 120,
      hydrationTarget: 2200,
      workoutTrack: "body-recomposition",
      focusHabit: "Prioritize protein at lunch and dinner"
    },
    {
      id: "member-3",
      name: "Dadi",
      role: "senior",
      gender: "female",
      age: 67,
      heightCm: 154,
      weightKg: 63,
      bodyFatPct: null,
      targetWeightKg: null,
      targetTimelineWeeks: 12,
      bodyProfile: "mobility-first",
      goal: "energy_boost",
      calorieTarget: 1550,
      proteinTarget: 70,
      hydrationTarget: 2000,
      workoutTrack: "seniors",
      focusHabit: "15-minute evening walk"
    }
  ],
  subscription: {
    tier: "premium",
    billingCycle: "monthly",
    autoRenew: true,
    nextBillingDate: "2026-05-03",
    amountInr: 2999,
    paymentMethod: "UPI • fitfamily@upi",
    invoiceEmail: "demo@fitfamilyindia.com"
  }
};
