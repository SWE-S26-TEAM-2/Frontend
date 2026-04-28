import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "sc_auth_token";

const PROTECTED_PREFIXES = [
  "/stream",
  "/library",
  "/notifications",
  "/settings",
  "/creator/upload",
  "/who-to-follow",
  "/search",
  "/messages",
  "/playlist",
];

const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const redirectToLogin = (request: NextRequest): NextResponse => {
  const url = request.nextUrl.clone();
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(next)}`;
  const response = NextResponse.redirect(url);
  response.cookies.set({ name: AUTH_COOKIE_NAME, value: "", path: "/", maxAge: 0 });
  return response;
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return redirectToLogin(request);
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  try {
    const verify = await fetch(`${apiBase}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!verify.ok) {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)"],
};
