import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 客户端 Supabase 实例（浏览器端使用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服务端 Supabase 实例（API Routes 使用）
export function getSupabaseServer() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

// 匿名使用追踪（localStorage）
const ANONYMOUS_KEY = "supernovba_anonymous_usage";

export interface AnonymousUsage {
  generationCount: number;
  lastGenerationAt: string;
}

export function getAnonymousUsage(): AnonymousUsage {
  if (typeof window === "undefined") {
    return { generationCount: 0, lastGenerationAt: "" };
  }
  try {
    const raw = localStorage.getItem(ANONYMOUS_KEY);
    if (raw) return JSON.parse(raw) as AnonymousUsage;
  } catch {
    // ignore
  }
  return { generationCount: 0, lastGenerationAt: "" };
}

export function incrementAnonymousUsage(): AnonymousUsage {
  const usage = getAnonymousUsage();
  usage.generationCount += 1;
  usage.lastGenerationAt = new Date().toISOString();
  if (typeof window !== "undefined") {
    localStorage.setItem(ANONYMOUS_KEY, JSON.stringify(usage));
  }
  return usage;
}
