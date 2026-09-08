import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface CookieEntry { name: string; value: string; options?: CookieOptions }

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers }
  });

  // If env is missing or still a placeholder, skip session refresh.
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) return supabaseResponse;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieEntry[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      }
    }
  });

  // IMPORTANT: refresh the session by calling getUser(); this rotates expiring
  // tokens via the cookie helpers above so subsequent server requests are valid.
  await supabase.auth.getUser();

  return supabaseResponse;
};

// Backward-compatible alias matching the snippet in the user spec
export const createClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers }
  });
  if (!supabaseUrl || !supabaseKey) return supabaseResponse;
  createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieEntry[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      }
    }
  });
  return supabaseResponse;
};
