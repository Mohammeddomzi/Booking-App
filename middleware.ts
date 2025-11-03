import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "en",
});

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    
    // If accessing root, redirect to English signup
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/en/auth/signup", req.url));
    }
    
    // If accessing without locale prefix and not an API route, add /en
    if (!pathname.startsWith("/en") && 
        !pathname.startsWith("/ar") && 
        !pathname.startsWith("/api") &&
        !pathname.startsWith("/_next") &&
        !pathname.includes(".")) {
      return NextResponse.redirect(new URL("/en" + pathname, req.url));
    }
    
    return intlMiddleware(req as unknown as NextRequest);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Public routes that don't require authentication
        if (pathname.includes("/auth/signin") || pathname.includes("/auth/signup")) {
          return true;
        }

        // Protected routes require token
        if (pathname.includes("/dashboard")) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/en/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
