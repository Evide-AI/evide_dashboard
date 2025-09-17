import { useState, useEffect } from "react";
import { checkServerHealth } from "../lib/auth-service";
import { backendStatusManager } from "../lib/backend-status";

export const useBackendStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      await checkServerHealth();
      setIsOnline(true);
      setLastChecked(new Date());
    } catch (error) {
      setIsOnline(false);
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();

    const unsubscribe = backendStatusManager.subscribe((status) => {
      setIsOnline(status);
      setLastChecked(new Date());
    });

    const handleOnline = () => {
      // Only check if we think backend is offline
      if (!isOnline) {
        checkStatus();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      backendStatusManager.setStatus(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isChecking,
    lastChecked,
    checkStatus,
  };
};
