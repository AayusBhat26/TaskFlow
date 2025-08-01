"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export const supabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables are not configured. Supabase features will be disabled.");
    return null;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
};
