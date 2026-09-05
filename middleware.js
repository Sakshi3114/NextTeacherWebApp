import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/lib/auth.config";

// Uses the Edge-safe config (no bcrypt/Credentials provider) since
// middleware runs in the Edge runtime. This is what actually replaces the
// old client-side `password === "admin@123"` check with server enforcement.
const { auth } = NextAuth(authConfig);

const roleRequirements = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/teacher", roles: ["ADMIN", "TEACHER"] },
  { prefix: "/student", roles: ["ADMIN", "STUDENT"] },
  { prefix: "/profile", roles: ["ADMIN", "TEACHER", "STUDENT"] },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const rule = roleRequirements.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (!rule.roles.includes(session.user.role)) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/profile/:path*"],
};
