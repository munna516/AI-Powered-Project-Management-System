"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getStoredToken, clearToken, TOKEN_KEY } from "./index";

const LOGIN_PATH = "/login";
const CHECK_INTERVAL_MS = 5000;

/**
 * Detects when auth token is removed or changed in localStorage and logs user out.
 * Add to protected layouts (dashboard, admin).
 */
export default function TokenGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const redirectToLogin = () => {
      clearToken();
      window.location.href = LOGIN_PATH;
    };

    const checkToken = () => {
      const token = getStoredToken();
      if (!token) {
        redirectToLogin();
      }
    };

    checkToken();

    const handleStorage = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue) {
        redirectToLogin();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkToken();
      }
    };

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const interval = setInterval(checkToken, CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
