import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true
});

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;

  const localeMatch = pathname.match(/^\/(ka|en|ru)(\/|$)/);
  const locale = localeMatch?.[1] ?? defaultLocale;
  const localizedPath = localeMatch ? pathname.replace(`/${locale}`, "") || "/" : pathname;

  const needsUser =
    localizedPath.startsWith("/orders") ||
    localizedPath.startsWith("/account") ||
    localizedPath.startsWith("/checkout") ||
    localizedPath.startsWith("/profile");
  const needsAdmin = localizedPath.startsWith("/admin");

  if (!needsUser && !needsAdmin) {
    return response;
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token?.sub) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (needsAdmin && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
