import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MOCK_USERS = [
  {
    id: "1",
    email: "admin@evide.com",
    role: "admin" as const,
  },
];

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("evide-dashboard-session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: "No session found" },
        { status: 401 }
      );
    }

    const userId = sessionCookie.value;
    const user = MOCK_USERS.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
