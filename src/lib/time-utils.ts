// Formatted time string like "04:00 PM"
export function formatTime(
  timeString: string,
  options: {
    hour12?: boolean;
    showSeconds?: boolean;
  } = {}
): string {
  const { hour12 = true, showSeconds = false } = options;

  if (!timeString) return "N/A";

  try {
    // Parse time string (HH:MM:SS or HH:MM)
    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

    if (isNaN(hours) || isNaN(minutes)) {
      return timeString; // Return original if parsing fails
    }

    if (hour12) {
      // 12-hour format with AM/PM
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12; // Convert 0 to 12
      const displayMinutes = minutes.toString().padStart(2, "0");

      if (showSeconds) {
        const displaySeconds = seconds.toString().padStart(2, "0");
        return `${displayHours}:${displayMinutes}:${displaySeconds} ${period}`;
      }

      return `${displayHours}:${displayMinutes} ${period}`;
    } else {
      // 24-hour format
      const displayHours = hours.toString().padStart(2, "0");
      const displayMinutes = minutes.toString().padStart(2, "0");

      if (showSeconds) {
        const displaySeconds = seconds.toString().padStart(2, "0");
        return `${displayHours}:${displayMinutes}:${displaySeconds}`;
      }

      return `${displayHours}:${displayMinutes}`;
    }
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
}

export function getRouteDisplayName(
  routeStops: Array<{ stop: { name: string }; sequence_order?: number }>
): string {
  if (!routeStops || routeStops.length === 0) {
    return "No stops";
  }

  if (routeStops.length === 1) {
    return routeStops[0].stop.name;
  }

  // Get first and last stop
  const firstStop = routeStops[0].stop.name;
  const lastStop = routeStops[routeStops.length - 1].stop.name;

  return `${firstStop} → ${lastStop}`;
}
