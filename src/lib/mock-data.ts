import { User, BusScreen, ContentItem } from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@evide.com",
    role: "admin",
  },
];

export const MOCK_CREDENTIALS = {
  "admin@evide.com": "admin123",
};

export const MOCK_BUS_SCREENS: BusScreen[] = [
  {
    id: "1",
    busName: "Kerala Express",
    busNumber: "KL-01-AB-1234",
    imei: "123456789012345",
    isOnline: true,
    lastSeen: new Date(),
    currentLocation: "Kochi Bus Stand",
    nextStop: "Thrissur",
    nextStopETA: "45 min",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    busName: "Malabar Cruiser",
    busNumber: "KL-02-CD-5678",
    imei: "987654321098765",
    isOnline: false,
    lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes
    currentLocation: "Kozhikode",
    nextStop: "Kannur",
    nextStopETA: "N/A",
    createdAt: new Date("2024-01-10"),
  },
];

export const MOCK_CONTENT: ContentItem[] = [
  {
    id: "1",
    title: "Kerala Tourism Ad",
    type: "video",
    url: "/content/kerala-tourism.mp4",
    duration: 30,
    isActive: true,
    createdAt: new Date("2024-01-20"),
  },
];
