"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEMO_EMAIL, DEMO_PASSWORD, isDemoModeEnabled } from "@/lib/demo-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const demoMode = isDemoModeEnabled();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: demoMode ? { email: DEMO_EMAIL, password: DEMO_PASSWORD } : undefined
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setFormError(null);

    const response = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", ...values })
    });

    const data = await response.json();

    if (!response.ok) {
      setFormError(data.error ?? "Login failed.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          {demoMode ? (
            <div className="mb-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
              Demo mode is active. Use <strong>{DEMO_EMAIL}</strong> and <strong>{DEMO_PASSWORD}</strong>.
            </div>
          ) : null}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input {...register("email")} placeholder="Email" />
            {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
            <Input {...register("password")} type="password" placeholder="Password" />
            {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
            {formError ? <p className="text-xs text-red-600">{formError}</p> : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Login"}</Button>
            {demoMode ? (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setValue("email", DEMO_EMAIL);
                  setValue("password", DEMO_PASSWORD);
                }}
              >
                Fill Demo Credentials
              </Button>
            ) : null}
          </form>
          <div className="mt-4 flex justify-between text-sm text-stone-600">
            <Link href="/forgot-password">Forgot password?</Link>
            <Link href="/signup">Create account</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
