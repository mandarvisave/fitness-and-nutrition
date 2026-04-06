"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { PlanComparisonTable } from "@/components/pricing/PlanComparisonTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/useSettingsStore";

const subscriptionSchema = z.object({
  tier: z.enum(["free", "core", "premium"]),
  billingCycle: z.literal("monthly"),
  autoRenew: z.boolean(),
  nextBillingDate: z.string().min(8),
  amountInr: z.coerce.number().min(0),
  paymentMethod: z.string().min(4),
  invoiceEmail: z.string().email()
});

const tierAmounts = {
  free: 0,
  core: 999,
  premium: 2999
} as const;

function tierLabel(tier: "free" | "core" | "premium") {
  if (tier === "free") return "Free";
  if (tier === "core") return "Core";
  return "Premium";
}

export default function SubscriptionSettingsPage() {
  const { hydrated, subscription, updateSubscription } = useSettingsStore();
  const [saved, setSaved] = useState(false);
  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: subscription
  });

  const selectedTier = form.watch("tier");

  useEffect(() => {
    if (hydrated) {
      form.reset(subscription);
    }
  }, [hydrated, subscription, form]);

  useEffect(() => {
    form.setValue("amountInr", tierAmounts[selectedTier], { shouldDirty: true });
  }, [selectedTier, form]);

  if (!hydrated) {
    return (
      <SettingsLayout currentPath="/settings/subscription" title="Subscription" description="Loading subscription details...">
        <div className="rounded-lg border bg-white p-6 shadow-soft">Loading subscription...</div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout currentPath="/settings/subscription" title="Subscription" description="Manage your plan, billing preferences, and demo access tier.">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-green-800">
              Active tier: <strong>{tierLabel(subscription.tier)}</strong>
            </div>
            <div className="grid gap-3 text-sm text-stone-600">
              <div className="rounded-lg border p-4">Monthly amount: <strong>{formatCurrency(subscription.amountInr)}</strong></div>
              <div className="rounded-lg border p-4">Next billing: <strong>{subscription.nextBillingDate}</strong></div>
              <div className="rounded-lg border p-4">Payment method: <strong>{subscription.paymentMethod}</strong></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => {
                updateSubscription(values);
                setSaved(true);
                setTimeout(() => setSaved(false), 1800);
              })}
            >
              <select {...form.register("tier")} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
                <option value="free">Free</option>
                <option value="core">Core - ₹999/month</option>
                <option value="premium">Premium - ₹2,999/month</option>
              </select>

              <select {...form.register("billingCycle")} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
                <option value="monthly">Monthly</option>
              </select>

              <Input {...form.register("amountInr")} type="number" placeholder="Amount in INR" />
              <Input {...form.register("nextBillingDate")} type="date" />
              <Input {...form.register("paymentMethod")} placeholder="Payment method" />
              <Input {...form.register("invoiceEmail")} placeholder="Invoice email" />

              <label className="flex items-center gap-3 rounded-lg border p-4 text-sm text-stone-700">
                <input type="checkbox" checked={form.watch("autoRenew")} onChange={(event) => form.setValue("autoRenew", event.target.checked)} className="h-5 w-5 accent-orange-500" />
                Keep auto-renew enabled for uninterrupted access
              </label>

              <div className="flex items-center gap-3">
                <Button type="submit">Save Subscription</Button>
                {saved ? <span className="text-sm text-green-700">Subscription saved</span> : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanComparisonTable />
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
