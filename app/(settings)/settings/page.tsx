"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { logoutDemoSession } from "@/lib/logout";
import { useSettingsStore } from "@/lib/store/useSettingsStore";

const profileSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  city: z.string().min(2),
  familyName: z.string().min(2),
  language: z.enum(["en", "hi"]),
  reminderTime: z.string().min(4)
});

const notificationSchema = z.object({
  mealReminders: z.boolean(),
  workoutReminders: z.boolean(),
  waterReminders: z.boolean(),
  weeklyReportEmails: z.boolean(),
  aiHindiNudges: z.boolean()
});

const householdSchema = z.object({
  familyChallengeEnabled: z.boolean(),
  festivalModeDefault: z.boolean(),
  weekendSyncChallenge: z.boolean(),
  conditionSpecificSuggestions: z.boolean()
});

function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-stone-500">{description}</div>
      </div>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 accent-orange-500" />
    </label>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const {
    hydrated,
    profile,
    notifications,
    household,
    hydrateFromDemoCookie,
    updateProfile,
    updateNotifications,
    updateHousehold
  } = useSettingsStore();
  const [profileSaved, setProfileSaved] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);
  const [householdSaved, setHouseholdSaved] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile
  });

  const notificationsForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: notifications
  });

  const householdForm = useForm<z.infer<typeof householdSchema>>({
    resolver: zodResolver(householdSchema),
    defaultValues: household
  });

  useEffect(() => {
    hydrateFromDemoCookie();
  }, [hydrateFromDemoCookie]);

  useEffect(() => {
    if (!hydrated) return;
    profileForm.reset(profile);
    notificationsForm.reset(notifications);
    householdForm.reset(household);
  }, [hydrated, profile, notifications, household, profileForm, notificationsForm, householdForm]);

  async function logout() {
    await logoutDemoSession();
    router.push("/login");
    router.refresh();
  }

  if (!hydrated) {
    return (
      <SettingsLayout currentPath="/settings" title="Settings" description="Loading your family preferences...">
        <div className="rounded-lg border bg-white p-6 shadow-soft">Loading settings...</div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout currentPath="/settings" title="Settings" description="Manage your profile, app language, reminders, and household defaults.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={profileForm.handleSubmit((values) => {
                updateProfile(values);
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 1800);
              })}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Input {...profileForm.register("fullName")} placeholder="Full name" />
                <Input {...profileForm.register("email")} placeholder="Email" />
                <Input {...profileForm.register("phone")} placeholder="Phone number" />
                <Input {...profileForm.register("city")} placeholder="City" />
                <Input {...profileForm.register("familyName")} placeholder="Family name" />
                <Input {...profileForm.register("reminderTime")} type="time" />
              </div>
              <select {...profileForm.register("language")} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
              <div className="flex items-center gap-3">
                <Button type="submit">Save Profile</Button>
                {profileSaved ? <span className="text-sm text-green-700">Profile saved</span> : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-stone-600">
            <div className="rounded-lg bg-orange-50 p-4 text-orange-800">
              You&apos;re using the local demo session. Changes here persist in your browser for testing.
            </div>
            <div>
              <div className="font-medium text-stone-900">Current account</div>
              <div>{profile.fullName}</div>
              <div>{profile.email}</div>
            </div>
            <Button variant="secondary" onClick={logout}>Logout Demo Session</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={notificationsForm.handleSubmit((values) => {
                updateNotifications(values);
                setNotificationsSaved(true);
                setTimeout(() => setNotificationsSaved(false), 1800);
              })}
            >
              <ToggleRow
                label="Meal reminders"
                description="Prompt the family to log breakfast, lunch, and dinner."
                checked={notificationsForm.watch("mealReminders")}
                onChange={(checked) => notificationsForm.setValue("mealReminders", checked)}
              />
              <ToggleRow
                label="Workout reminders"
                description="Send movement prompts for assigned workout tracks."
                checked={notificationsForm.watch("workoutReminders")}
                onChange={(checked) => notificationsForm.setValue("workoutReminders", checked)}
              />
              <ToggleRow
                label="Water reminders"
                description="Keep hydration nudges active through the day."
                checked={notificationsForm.watch("waterReminders")}
                onChange={(checked) => notificationsForm.setValue("waterReminders", checked)}
              />
              <ToggleRow
                label="Weekly report emails"
                description="Email the family summary and risks every Sunday."
                checked={notificationsForm.watch("weeklyReportEmails")}
                onChange={(checked) => notificationsForm.setValue("weeklyReportEmails", checked)}
              />
              <ToggleRow
                label="Hindi AI nudges"
                description="Prefer Hindi phrasing in nudges and reminders."
                checked={notificationsForm.watch("aiHindiNudges")}
                onChange={(checked) => notificationsForm.setValue("aiHindiNudges", checked)}
              />
              <div className="flex items-center gap-3">
                <Button type="submit">Save Notifications</Button>
                {notificationsSaved ? <span className="text-sm text-green-700">Notification settings saved</span> : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Household Defaults</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={householdForm.handleSubmit((values) => {
                updateHousehold(values);
                setHouseholdSaved(true);
                setTimeout(() => setHouseholdSaved(false), 1800);
              })}
            >
              <ToggleRow
                label="Family challenges"
                description="Enable weekly challenge prompts for all members."
                checked={householdForm.watch("familyChallengeEnabled")}
                onChange={(checked) => householdForm.setValue("familyChallengeEnabled", checked)}
              />
              <ToggleRow
                label="Festival Mode by default"
                description="Relax calories and protect streaks during festive logging."
                checked={householdForm.watch("festivalModeDefault")}
                onChange={(checked) => householdForm.setValue("festivalModeDefault", checked)}
              />
              <ToggleRow
                label="Weekend sync challenge"
                description="Prompt shared walks or workouts every weekend."
                checked={householdForm.watch("weekendSyncChallenge")}
                onChange={(checked) => householdForm.setValue("weekendSyncChallenge", checked)}
              />
              <ToggleRow
                label="Condition-specific suggestions"
                description="Recommend diabetes, BP, or joint-pain wellness plans automatically."
                checked={householdForm.watch("conditionSpecificSuggestions")}
                onChange={(checked) => householdForm.setValue("conditionSpecificSuggestions", checked)}
              />
              <div className="flex items-center gap-3">
                <Button type="submit">Save Household Defaults</Button>
                {householdSaved ? <span className="text-sm text-green-700">Household settings saved</span> : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
