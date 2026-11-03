// Error-resilient storage wrapper for mobile webviews, Safari Private Browsing & sandboxed iframes

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // In-app webview / private browsing security restriction
    }
    return memoryStore[key] !== undefined ? memoryStore[key] : null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // Storage quota or security error
    }
    memoryStore[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // ignore
    }
    delete memoryStore[key];
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      // ignore
    }
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  }
};
