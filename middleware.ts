import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {

  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

<<<<<<< HEAD
  const protectedPaths = ["/", "/saved-tasks"];

  if (!session && protectedPaths.includes(request.nextUrl.pathname)) {
=======
  const path = request.nextUrl.pathname;

  // If user not logged in → redirect to login
  if (!session && path !== "/login") {
>>>>>>> 0365abe41122ce461a12d0d0639dae2b02b98f02
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user already logged in → prevent going back to login page
  if (session && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
<<<<<<< HEAD
  matcher: ["/", "/saved-tasks"],
=======
  matcher: ["/", "/login"],
>>>>>>> 0365abe41122ce461a12d0d0639dae2b02b98f02
};
