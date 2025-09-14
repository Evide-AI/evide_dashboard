import { User, BusScreen, ContentItem } from "../types";

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
    lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    currentLocation: "Kozhikode",
    nextStop: "Kannur",
    nextStopETA: "N/A",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    busName: "Gods Own Country Express",
    busNumber: "KL-03-EF-9012",
    imei: "456789012345678",
    isOnline: true,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    currentLocation: "Trivandrum Central",
    nextStop: "Kollam",
    nextStopETA: "30 min",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "4",
    busName: "Backwater Special",
    busNumber: "KL-04-GH-3456",
    imei: "789012345678901",
    isOnline: true,
    lastSeen: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    currentLocation: "Alleppey",
    nextStop: "Ernakulam",
    nextStopETA: "20 min",
    createdAt: new Date("2024-01-25"),
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
  {
    id: "2",
    title: "Safety Instructions",
    type: "video",
    url: "/content/safety-instructions.mp4",
    duration: 45,
    isActive: true,
    createdAt: new Date("2024-01-18"),
  },
  {
    id: "3",
    title: "Route Map - Kochi to Trivandrum",
    type: "image",
    url: "/content/route-map-kochi-tvpm.jpg",
    duration: 15,
    isActive: true,
    createdAt: new Date("2024-01-22"),
  },
  {
    id: "4",
    title: "Emergency Contact Info",
    type: "image",
    url: "/content/emergency-contacts.jpg",
    duration: 20,
    isActive: false,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "5",
    title: "Welcome Aboard",
    type: "video",
    url: "/content/welcome-aboard.mp4",
    duration: 25,
    isActive: true,
    createdAt: new Date("2024-01-25"),
  },
];

// Mock API response helpers
export const mockApiResponse = <T>(
  data: T,
  delay: number = 500
): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (
  message: string,
  delay: number = 500
): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};

// Dashboard statistics
export const getDashboardStats = () => {
  const totalScreens = MOCK_BUS_SCREENS.length;
  const onlineScreens = MOCK_BUS_SCREENS.filter(
    (screen) => screen.isOnline
  ).length;
  const activeContent = MOCK_CONTENT.filter(
    (content) => content.isActive
  ).length;
  const totalContent = MOCK_CONTENT.length;

  return mockApiResponse({
    totalScreens,
    onlineScreens,
    offlineScreens: totalScreens - onlineScreens,
    activeContent,
    totalContent,
    inactiveContent: totalContent - activeContent,
  });
};

// Screen management
export const getBusScreens = () => mockApiResponse(MOCK_BUS_SCREENS);

export const getBusScreenById = (id: string) => {
  const screen = MOCK_BUS_SCREENS.find((s) => s.id === id);
  return screen ? mockApiResponse(screen) : mockApiError("Screen not found");
};

export const updateBusScreen = (id: string, updates: Partial<BusScreen>) => {
  const screenIndex = MOCK_BUS_SCREENS.findIndex((s) => s.id === id);
  if (screenIndex === -1) {
    return mockApiError("Screen not found");
  }

  MOCK_BUS_SCREENS[screenIndex] = {
    ...MOCK_BUS_SCREENS[screenIndex],
    ...updates,
  };
  return mockApiResponse(MOCK_BUS_SCREENS[screenIndex]);
};

// Content management
export const getContentItems = () => mockApiResponse(MOCK_CONTENT);

export const getContentById = (id: string) => {
  const content = MOCK_CONTENT.find((c) => c.id === id);
  return content ? mockApiResponse(content) : mockApiError("Content not found");
};

export const updateContent = (id: string, updates: Partial<ContentItem>) => {
  const contentIndex = MOCK_CONTENT.findIndex((c) => c.id === id);
  if (contentIndex === -1) {
    return mockApiError("Content not found");
  }

  MOCK_CONTENT[contentIndex] = { ...MOCK_CONTENT[contentIndex], ...updates };
  return mockApiResponse(MOCK_CONTENT[contentIndex]);
};

export const createContent = (
  content: Omit<ContentItem, "id" | "createdAt">
) => {
  const newContent: ContentItem = {
    ...content,
    id: String(MOCK_CONTENT.length + 1),
    createdAt: new Date(),
  };
  MOCK_CONTENT.push(newContent);
  return mockApiResponse(newContent);
};

export const deleteContent = (id: string) => {
  const contentIndex = MOCK_CONTENT.findIndex((c) => c.id === id);
  if (contentIndex === -1) {
    return mockApiError("Content not found");
  }

  MOCK_CONTENT.splice(contentIndex, 1);
  return mockApiResponse({ success: true });
};
