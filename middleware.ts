import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString();
      const [u, p] = decoded.split(":");
      if (u === "sakera" && p === "sakera1") {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Akses ditolak. Silakan login.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Sakera Bakery"' },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
