/**
 * Common API utilities with token verification and 401 Unauthorized logout.
 *
 * Usage:
 *   import { apiGet, apiPost, apiPut, apiPatch, apiDelete, setToken, clearToken } from "@/lib/api";
 *
 * Login flow: After successful login, call setToken(response.token) to store the token.
 * Logout: Call clearToken() and redirect to /login.
 *
 * On 401 Unauthorized: Token is cleared and user is redirected to /login.
 *
 * Storage: Set NEXT_PUBLIC_AUTH_STORAGE in .env:
 *   - "localStorage" (default) - token in localStorage
 *   - "cookie" - token in httpOnly-style cookie (sent with credentials: 'include')
 */

export const TOKEN_KEY = "auth_token";
export const RESET_TOKEN_KEY = "reset_token";
export const USER_KEY = "auth_user";
const LOGIN_PATH = "/login";
const COOKIE_MAX_AGE_DAYS = 7;

const AUTH_STORAGE = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_AUTH_STORAGE) || "localStorage";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

// Cookie helpers
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days = COOKIE_MAX_AGE_DAYS) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = typeof window !== "undefined" && window.location?.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax${secure}`;
}

function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return AUTH_STORAGE === "cookie" ? getCookie(TOKEN_KEY) : localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

const AUTH_KEYS = [TOKEN_KEY, "refresh_token", "access_token"];

export function clearToken() {
  if (typeof window === "undefined") return;
  try {
    AUTH_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      deleteCookie(key);
    });
    localStorage.removeItem(RESET_TOKEN_KEY);
    clearUser();
  } catch {}
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (AUTH_STORAGE === "cookie") {
      setCookie(TOKEN_KEY, token);
    } else {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {}
}

export function getStoredToken() {
  return getToken();
}

export function setUser(user) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export function clearUser() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_KEY);
  } catch {}
}

function useCredentials() {
  return AUTH_STORAGE === "cookie";
}

function handleUnauthorized() {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = LOGIN_PATH;
  }
}

function buildUrl(endpoint) {
  const base = getBaseUrl().replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

function getHeaders(customHeaders = {}, options = {}) {
  const { includeAuth = true, isFormData = false } = options;
  const headers = { ...customHeaders };

  if (isFormData) {
    delete headers["Content-Type"];
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (includeAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse(response, options = {}) {
  const { skip401Redirect = false } = options;
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const errorData = isJson ? await response.json().catch(() => ({})) : { message: await response.text() };
    const errorMessage = errorData?.message || errorData?.error || `Request failed: ${response.status}`;

    if (response.status === 401 && !skip401Redirect) {
      handleUnauthorized();
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null;
  }

  return isJson ? response.json() : response.text();
}

/**
 * GET request
 * @param {string} endpoint - API endpoint (e.g. "/users" or "users")
 * @param {object} options - { headers?: object, params?: object }
 */
export async function apiGet(endpoint, options = {}) {
  const { headers: customHeaders = {}, params, skipAuth = false } = options;

  let url = buildUrl(endpoint);
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams(params).toString();
    url += `?${search}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(customHeaders, { includeAuth: !skipAuth }),
    credentials: useCredentials() ? "include" : "same-origin",
  });

  return handleResponse(response);
}

/**
 * POST request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {object} options - { headers?: object }
 */
export async function apiPost(endpoint, data, options = {}) {
  const { headers: customHeaders = {}, skipAuth = false, skip401Redirect = false } = options;
  const isFormData = data instanceof FormData;

  const response = await fetch(buildUrl(endpoint), {
    method: "POST",
    headers: getHeaders(customHeaders, { includeAuth: !skipAuth, isFormData }),
    body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    credentials: useCredentials() ? "include" : "same-origin",
  });

  return handleResponse(response, { skip401Redirect });
}

/**
 * PUT request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {object} options - { headers?: object }
 */
export async function apiPut(endpoint, data, options = {}) {
  const { headers: customHeaders = {}, skipAuth = false } = options;
  const isFormData = data instanceof FormData;

  const response = await fetch(buildUrl(endpoint), {
    method: "PUT",
    headers: getHeaders(customHeaders, { includeAuth: !skipAuth, isFormData }),
    body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    credentials: useCredentials() ? "include" : "same-origin",
  });

  return handleResponse(response);
}

/**
 * PATCH request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {object} options - { headers?: object }
 */
export async function apiPatch(endpoint, data, options = {}) {
  const { headers: customHeaders = {}, skipAuth = false } = options;
  const isFormData = data instanceof FormData;

  const response = await fetch(buildUrl(endpoint), {
    method: "PATCH",
    headers: getHeaders(customHeaders, { includeAuth: !skipAuth, isFormData }),
    body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    credentials: useCredentials() ? "include" : "same-origin",
  });

  return handleResponse(response);
}

/**
 * Logout: clears token + cookie, calls logout API with token, then redirects.
 * @param {string} redirectPath - Path to redirect to (default: /login)
 * @param {number} delayMs - Delay before redirect in ms (e.g. 2000 for 2 seconds)
 */
export function logoutAndRedirect(redirectPath = LOGIN_PATH, delayMs = 0) {
  const token = getToken();
  clearToken();

  if (token) {
    fetch(buildUrl("/api/auth/logout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
      credentials: useCredentials() ? "include" : "same-origin",
    }).catch(() => {});
  }

  if (typeof window !== "undefined") {
    const redirect = () => { window.location.href = redirectPath; };
    delayMs > 0 ? setTimeout(redirect, delayMs) : redirect();
  }
}

/**
 * DELETE request
 * @param {string} endpoint - API endpoint
 * @param {object} options - { headers?: object }
 */
export async function apiDelete(endpoint, options = {}) {
  const { headers: customHeaders = {}, skipAuth = false } = options;

  const response = await fetch(buildUrl(endpoint), {
    method: "DELETE",
    headers: getHeaders(customHeaders, { includeAuth: !skipAuth }),
    credentials: useCredentials() ? "include" : "same-origin",
  });

  return handleResponse(response);
}
