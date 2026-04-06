"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const schema = z.object({
  familyName: z.string().min(2),
  city: z.string().min(2)
});

export default function FamilySetupPage() {
  const { register, handleSubmit } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return <main className="mx-auto max-w-2xl px-4 py-10"><Card><CardHeader><CardTitle>Set up your family</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={handleSubmit(() => undefined)}><Input {...register("familyName")} placeholder="Family name" /><Input {...register("city")} placeholder="City" /><Button type="submit">Continue</Button></form></CardContent></Card></main>;
}
