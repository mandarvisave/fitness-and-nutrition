"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isDemoModeEnabled } from "@/lib/demo-auth";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  language: z.enum(["en", "hi"])
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const demoMode = isDemoModeEnabled();
  const { register, setValue, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { language: "en" }
  });

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language.startsWith("hi")) {
      setValue("language", "hi");
    }
  }, [setValue]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setFormError(null);

    const response = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", ...values })
    });

    const data = await response.json();

    if (!response.ok) {
      setFormError(data.error ?? "Signup failed.");
      setIsSubmitting(false);
      return;
    }

    router.push("/onboarding/family-setup");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create your family account</CardTitle>
        </CardHeader>
        <CardContent>
          {demoMode ? (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              Demo mode is active. Any valid signup form will create a local demo session and take you into onboarding.
            </div>
          ) : null}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input {...register("fullName")} placeholder="Full name" />
            <Input {...register("email")} placeholder="Email" />
            <Input {...register("password")} type="password" placeholder="Password" />
            <select {...register("language")} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
            {formError ? <p className="text-xs text-red-600">{formError}</p> : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Sign up"}</Button>
          </form>
          <p className="mt-4 text-sm text-stone-600">Already have an account? <Link href="/login" className="text-primary">Login</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
