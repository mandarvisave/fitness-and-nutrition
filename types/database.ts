export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  language: "en" | "hi";
  subscription_tier: "free" | "core" | "premium";
  subscription_expires_at: string | null;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other" | null;
  role: "parent" | "child" | "senior" | null;
  goal: "weight_loss" | "muscle_gain" | "general_fitness" | "energy_boost" | "body_recomposition" | null;
  medical_conditions: string[] | null;
  height_cm: number | null;
  weight_kg: number | null;
  created_at: string;
}

export interface Assessment {
  id: string;
  user_id: string | null;
  answers: Json;
  total_score: number | null;
  level: string | null;
  goal: string | null;
  report_data: Json | null;
  created_at: string;
}
