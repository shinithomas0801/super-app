import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabase } from "@/infrastructure/supabase/middleware-client";
import { ROUTES } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabase(request);

  // Refreshes session cookies; do not add unrelated logic before getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isEducationRoute = pathname.startsWith("/education");
  const isApi = pathname.startsWith("/api");
  const isRootLoginRoute = pathname === ROUTES.HOME;
  const isLoginRoute = pathname === ROUTES.LOGIN;
  const isProtectedRoute = isEducationRoute;

  if (isProtectedRoute && !user && !isApi) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ROUTES.LOGIN;
    loginUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(loginUrl);
  }

  if ((isLoginRoute || isRootLoginRoute) && user) {
    const nextUrl =
      request.nextUrl.searchParams.get("next") || ROUTES.EDUCATION;
    const target = request.nextUrl.clone();
    target.pathname = nextUrl.startsWith("/") ? nextUrl : ROUTES.EDUCATION;
    target.search = "";
    return NextResponse.redirect(target);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
