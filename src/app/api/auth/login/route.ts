import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MOCK_USERS = [
  {
    id: "1",
    email: "admin@evide.com",
    role: "admin" as const,
  },
];

const MOCK_CREDENTIALS = {
  "admin@evide.com": "admin123",
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const expectedPassword =
      MOCK_CREDENTIALS[email as keyof typeof MOCK_CREDENTIALS];

    if (expectedPassword && expectedPassword === password) {
      const user = MOCK_USERS.find((u) => u.email === email);

      if (user) {
        const response = NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        });

        response.cookies.set("evide-dashboard-session", user.id, {
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        return response;
      }
    }

    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
