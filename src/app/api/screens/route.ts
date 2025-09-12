import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MOCK_BUS_SCREENS = [
  {
    id: "1",
    busName: "Kerala Express",
    busNumber: "KL-01-AB-1234",
    imei: "123456789012345",
    isOnline: true,
    lastSeen: new Date().toISOString(),
    currentLocation: "Kochi Bus Stand",
    nextStop: "Thrissur",
    nextStopETA: "45 min",
    createdAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "2",
    busName: "Malabar Cruiser",
    busNumber: "KL-02-CD-5678",
    imei: "987654321098765",
    isOnline: false,
    lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    currentLocation: "Kozhikode",
    nextStop: "Kannur",
    nextStopETA: "N/A",
    createdAt: new Date("2024-01-10").toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("evide-dashboard-session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // dummy API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      screens: MOCK_BUS_SCREENS,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
