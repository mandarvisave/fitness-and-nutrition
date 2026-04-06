"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function FoodSearchBar() {
  const [query, setQuery] = useState("");
  return <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Indian foods, e.g. idli, rajma, poha" />;
}
