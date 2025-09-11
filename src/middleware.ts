import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthPath = request.nextUrl.pathname.startsWith("/login");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  const hasSession = request.cookies.get("evide-dashboard-session");

  if (isDashboardPage && !hasSession)
    return NextResponse.redirect(new URL("/login", request.url));

  if (isAuthPath && hasSession)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
