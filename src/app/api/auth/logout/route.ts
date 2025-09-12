import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  response.cookies.set("evide-dashboard-session", "", {
    path: "/",
    expires: new Date(0),
  });

  return response;
}
