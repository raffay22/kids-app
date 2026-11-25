import { NextResponse, type NextRequest } from "next/server";
import { COUNTRY_COOKIE } from "@/utils/country";
import { updateSession } from "@/utils/supabase/middleware";

function attachDetectedCountryCookie(request: NextRequest, response: NextResponse) {
  if (request.cookies.get(COUNTRY_COOKIE)?.value) return response;
  const headerCountry =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code");
  const normalized = headerCountry?.trim().toUpperCase();
  if (normalized && /^[A-Z]{2}$/.test(normalized)) {
    response.cookies.set(COUNTRY_COOKIE, normalized, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url?.startsWith("http")) {
    return attachDetectedCountryCookie(request, NextResponse.next({ request }));
  }
  const response = await updateSession(request);
  return attachDetectedCountryCookie(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|lottie)$).*)",
  ],
};
