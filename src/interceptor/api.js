import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// ---------------- Circuit Breaker ----------------
class CircuitBreaker {
  constructor(failureThreshold = 5, timeout = 30000) {
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = "CLOSED";
    this.nextAttempt = Date.now();
  }

  async call(fn) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt)
        throw new Error("Circuit breaker is OPEN");
      this.state = "HALF_OPEN";
    }
    try {
      const result = await fn();
      this.success();
      return result;
    } catch (error) {
      this.failure();
      throw error;
    }
  }

  success() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  failure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// ---------------- Priority Queue ----------------
class PriorityQueue {
  constructor() {
    this.highPriority = [];
    this.normalPriority = [];
    this.lowPriority = [];
  }

  add(request, priority = "normal") {
    const item = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    switch (priority) {
      case "high":
        this.highPriority.push(item);
        break;
      case "low":
        this.lowPriority.push(item);
        break;
      default:
        this.normalPriority.push(item);
    }
  }

  getNext() {
    if (this.highPriority.length) return this.highPriority.shift();
    if (this.normalPriority.length) return this.normalPriority.shift();
    return this.lowPriority.shift();
  }

  isEmpty() {
    return (
      !this.highPriority.length &&
      !this.normalPriority.length &&
      !this.lowPriority.length
    );
  }

  clear() {
    this.highPriority = [];
    this.normalPriority = [];
    this.lowPriority = [];
  }
}

// ---------------- Exponential Backoff ----------------
const exponentialBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelay * 2 ** attempt + Math.random() * 1000;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

// ---------------- Axios Instance ----------------
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ---------------- Retry for GET/HEAD/OPTIONS ----------------
const shouldRetryRequest = (error) => {
  if (!error.config) return false;
  const method = error.config.method?.toLowerCase();
  if (!["get", "head", "options"].includes(method)) return false;
  return (
    !error.response ||
    (error.response.status >= 500 && error.response.status < 600) ||
    error.code === "NETWORK_ERROR"
  );
};

const retryRequest = async (fn, maxRetries = 3, baseDelay = 500) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !shouldRetryRequest(error)) throw error;
      const delay = baseDelay * 2 ** attempt + Math.random() * 200;
      console.log(`Retrying request in ${Math.round(delay)}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

// ---------------- EnterpriseTokenManager ----------------
class EnterpriseTokenManager {
  constructor() {
    this.refreshCall = null;
    this.isRefreshing = false;
    this.failedQueue = new PriorityQueue();
    this.tokenMonitorInterval = null;
    this.circuitBreaker = new CircuitBreaker();
    this.visibilityHandler = null;
    this.lastRefreshTime = null;

    this.bc = new BroadcastChannel("auth");
    this.bc.onmessage = (msg) => {
      if (msg.data === "TOKEN_REFRESHED") {
        this.processQueue(null);
        this.lastRefreshTime = Date.now();
        console.log("Token refreshed in another tab, updated locally");
      }
    };

    this.skipEndpoints = ["/refresh", "/logout", "/health", "/me"];
    this.publicEndpoints = ["/", "/register", "/login", "/public"];
  }

  shouldIntercept(url) {
    if (!url) return false;
    return (
      !this.publicEndpoints.some((e) => url.includes(e)) &&
      !this.skipEndpoints.some((e) => url.includes(e))
    );
  }

  isAuthError(error) {
    return (
      error.response?.status === 401 && !error.config?.url?.includes("/login")
    );
  }

  isNetworkError(error) {
    return !error.response || error.code === "NETWORK_ERROR";
  }

  addToQueue(originalRequest, priority = "normal") {
    return new Promise((resolve, reject) => {
      this.failedQueue.add(
        { resolve, reject, config: originalRequest },
        priority
      );
    });
  }

  processQueue(error) {
    while (!this.failedQueue.isEmpty()) {
      const item = this.failedQueue.getNext();
      if (error) item.reject(error);
      else item.resolve(api(item.config));
    }
  }

  async refreshToken() {
    if (this.isRefreshing) return this.refreshCall;
    this.isRefreshing = true;

    this.refreshCall = this.circuitBreaker.call(() =>
      exponentialBackoff(() => api.post("/refresh"), 3, 1000)
    );

    try {
      const result = await this.refreshCall;
      this.processQueue(null);
      this.lastRefreshTime = Date.now();
      this.bc.postMessage("TOKEN_REFRESHED");
      console.log("Token refreshed successfully");
      return result;
    } catch (error) {
      this.processQueue(error);
      if (error.response?.status === 401) this.handleCriticalAuthFailure(error);
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshCall = null;
    }
  }

  async handleError(error) {
    const originalRequest = error.config;

    if (
      !this.shouldIntercept(originalRequest?.url) ||
      this.isNetworkError(error)
    ) {
      return Promise.reject(error);
    }

    if (this.isAuthError(error) && this.isRefreshing) {
      return this.addToQueue(
        originalRequest,
        originalRequest._priority || "normal"
      );
    }

    if (this.isAuthError(error)) {
      try {
        await this.refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }

  async refreshTokenSilently() {
    if (this.isRefreshing) return;
    try {
      await this.refreshToken();
    } catch (e) {
      console.debug("Silent refresh failed", e.message);
    }
  }

  startTokenMonitor() {
    if (this.tokenMonitorInterval) return;
    this.tokenMonitorInterval = setInterval(() => {
      this.refreshTokenSilently().catch(() => {});
      console.log("дернул");
    }, 300000);
  }

  stopTokenMonitor() {
    if (this.tokenMonitorInterval) {
      clearInterval(this.tokenMonitorInterval);
      this.tokenMonitorInterval = null;
    }
  }

  setupVisibilityHandler() {
    if (typeof document === "undefined") return;
    let hiddenTime = null;
    const MAX_IDLE_MS = 5 * 60 * 1000;

    this.visibilityHandler = () => {
      if (document.visibilityState === "hidden") hiddenTime = Date.now();
      else if (document.visibilityState === "visible") {
        if (!hiddenTime || Date.now() - hiddenTime >= MAX_IDLE_MS) {
          this.refreshTokenSilently();
          console.log("Visibility change: token refresh triggered");
        }
        hiddenTime = null;
      }
    };

    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  removeVisibilityHandler() {
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    if (this.bc) {
      this.bc.close();
      this.bc = null;
    }
  }

  handleCriticalAuthFailure(error) {
    console.error("Critical authentication failure:", error);
    localStorage.clear();
    sessionStorage.clear();
    this.circuitBreaker.state = "OPEN";
    const currentPath = window.location.pathname + window.location.search;
    setTimeout(() => {
      window.location.href = `/?session_expired=true&redirect=${encodeURIComponent(
        currentPath
      )}`;
    }, 500);
  }

  getLastRefreshTime() {
    return this.lastRefreshTime;
  }

  init() {
    console.log("Token manager initialized, monitoring started");
    this.startTokenMonitor();
    this.setupVisibilityHandler();
  }

  destroy() {
    this.stopTokenMonitor();
    this.failedQueue.clear();
    this.removeVisibilityHandler();
    this.circuitBreaker.state = "OPEN";
    console.log("Token manager destroyed");
  }
}

// ---------------- Axios Interceptors ----------------
const tokenManager = new EnterpriseTokenManager();

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    try {
      return await tokenManager.handleError(error);
    } catch (err) {
      if (shouldRetryRequest(err)) {
        return retryRequest(() => api(err.config), 3);
      }
      throw err;
    }
  }
);

export default api;
export { tokenManager };
