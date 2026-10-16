import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PREVIEW = "fr_preview";

function comingSoon(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/coming-soon";
  return NextResponse.rewrite(url);
}

export function proxy(request: NextRequest) {
  if (process.env.COMING_SOON === "false") return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname === "/dev" || pathname === "/dev/") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const res = NextResponse.redirect(url);
    res.cookies.set(PREVIEW, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/coming-soon")
  ) {
    return NextResponse.next();
  }

  if (request.cookies.get(PREVIEW)?.value === "1") {
    return NextResponse.next();
  }

  return comingSoon(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
