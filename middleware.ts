import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

const locales = ["te", "en"];
const publicPages = ["/", "/sign-in", "/sign-up"];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
});

// Wrap the intlMiddleware to add the x-pathname header
const wrappedIntlMiddleware = (request: NextRequest) => {
  const response = intlMiddleware(request);
  if (response) {
    response.headers.set('x-pathname', request.nextUrl.pathname);
  }
  return response;
};

const authMiddleware = withAuth(
  function onSuccess(req) {
    return wrappedIntlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token !== null,
    },
    pages: {
      signIn: "/sign-in",
    },
  }
);

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join("|")}))?(${publicPages.join("|")})?/?$`,
    "i"
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return wrappedIntlMiddleware(req);
  } else {
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
