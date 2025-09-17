class BackendStatusManager {
  private isOnline = false;
  private listeners: ((status: boolean) => void)[] = [];

  setStatus(online: boolean) {
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.notifyListeners();
    }
  }

  getStatus() {
    return this.isOnline;
  }

  subscribe(listener: (status: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.isOnline));
  }
}

export const backendStatusManager = new BackendStatusManager();
