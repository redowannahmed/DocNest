/**
 * SessionManager - Handles multi-tab authentication sessions
 * Each browser tab maintains its own session using sessionStorage
 * while providing a fallback to localStorage for single-session scenarios
 */

class SessionManager {
  constructor() {
    this.USER_KEY = 'user';
    this.TOKEN_KEY = 'token';
    this.SESSION_ID_KEY = 'session_id';
    
    // Generate unique session ID for this tab
    this.sessionId = this.getOrCreateSessionId();
  }

  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem(this.SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(this.SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  // Set user data for current tab
  setUser(userData) {
    if (!userData) {
      sessionStorage.removeItem(this.USER_KEY);
      return;
    }
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    
    // Also update localStorage for compatibility (but this will be tab-specific now)
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  // Get user data for current tab
  getUser() {
    // Priority: sessionStorage (tab-specific) -> localStorage (fallback)
    const sessionUser = sessionStorage.getItem(this.USER_KEY);
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch (e) {
        console.error('Error parsing session user data:', e);
      }
    }

    // Fallback to localStorage
    const localUser = localStorage.getItem(this.USER_KEY);
    if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        // Migrate to sessionStorage
        this.setUser(userData);
        return userData;
      } catch (e) {
        console.error('Error parsing local user data:', e);
      }
    }

    return null;
  }

  // Set token for current tab
  setToken(token) {
    if (!token) {
      sessionStorage.removeItem(this.TOKEN_KEY);
      return;
    }
    sessionStorage.setItem(this.TOKEN_KEY, token);
    
    // Also update localStorage for compatibility
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get token for current tab
  getToken() {
    // Priority: sessionStorage (tab-specific) -> localStorage (fallback)
    return sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
  }

  // Login - set both user and token
  login(userData, token) {
    this.setUser(userData);
    this.setToken(token);
    
    console.log(`[SessionManager] Login successful for ${userData.role}: ${userData.name} (Session: ${this.sessionId})`);
  }

  // Logout - clear current tab's session
  logout() {
    const user = this.getUser();
    console.log(`[SessionManager] Logging out ${user?.role}: ${user?.name} (Session: ${this.sessionId})`);
    
    // Clear sessionStorage for this tab
    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    
    // Don't clear localStorage as other tabs might be using it
    // Only clear localStorage if this was the last/only session
    this.clearLocalStorageIfNeeded();
  }

  // Clear localStorage only if no other tabs are active
  clearLocalStorageIfNeeded() {
    // This is a simple approach - in production you might want more sophisticated session tracking
    setTimeout(() => {
      // Check if any other tabs have sessions
      const hasSessionData = sessionStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
      if (!hasSessionData) {
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
      }
    }, 100);
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!(this.getUser() && this.getToken());
  }

  // Get session info for debugging
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      user: this.getUser(),
      hasToken: !!this.getToken(),
      storage: {
        session: {
          user: !!sessionStorage.getItem(this.USER_KEY),
          token: !!sessionStorage.getItem(this.TOKEN_KEY)
        },
        local: {
          user: !!localStorage.getItem(this.USER_KEY),
          token: !!localStorage.getItem(this.TOKEN_KEY)
        }
      }
    };
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
