"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { defaultSettings } from "@/lib/demo-settings";
import type { HouseholdSettings, MemberGoalSettings, NotificationSettings, ProfileSettings, SettingsState, SubscriptionSettings } from "@/types/settings";

interface SettingsStore extends SettingsState {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  hydrateFromDemoCookie: () => void;
  updateProfile: (profile: ProfileSettings) => void;
  updateNotifications: (notifications: NotificationSettings) => void;
  updateHousehold: (household: HouseholdSettings) => void;
  replaceMemberGoals: (memberGoals: MemberGoalSettings[]) => void;
  updateSubscription: (subscription: SubscriptionSettings) => void;
}

function parseCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function syncDemoUserCookie(profile: ProfileSettings) {
  if (typeof document === "undefined") return;
  document.cookie = `fitfamily-demo-user=${encodeURIComponent(JSON.stringify({
    fullName: profile.fullName,
    email: profile.email,
    language: profile.language
  }))}; path=/; SameSite=Lax`;
}

function syncTierCookie(tier: SubscriptionSettings["tier"]) {
  if (typeof document === "undefined") return;
  document.cookie = `fitfamily-tier=${tier}; path=/; SameSite=Lax`;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      hydrateFromDemoCookie: () => {
        const cookieValue = parseCookie("fitfamily-demo-user");
        if (!cookieValue) return;

        try {
          const parsed = JSON.parse(cookieValue) as Partial<ProfileSettings>;
          set((state) => ({
            profile: {
              ...state.profile,
              fullName: parsed.fullName ?? state.profile.fullName,
              email: parsed.email ?? state.profile.email,
              language: parsed.language ?? state.profile.language
            }
          }));
        } catch {}
      },
      updateProfile: (profile) => {
        syncDemoUserCookie(profile);
        set({ profile });
      },
      updateNotifications: (notifications) => set({ notifications }),
      updateHousehold: (household) => set({ household }),
      replaceMemberGoals: (memberGoals) => set({ memberGoals }),
      updateSubscription: (subscription) => {
        syncTierCookie(subscription.tier);
        set({ subscription });
      }
    }),
    {
      name: "fitfamily-settings-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      }
    }
  )
);
