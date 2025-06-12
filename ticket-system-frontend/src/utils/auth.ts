import type { User } from "../types";
import { useAuthStore } from "../store";

/**
 * Authentication utility functions
 */

/**
 * Verify authentication status with the backend
 */
export const verifyAuth = async (): Promise<{authenticated: boolean, user: User | null}> => {
  try {
    const { token } = useAuthStore.getState();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
      method: "GET",
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      credentials: "include", // Send cookies
    });

    const data = await res.json();

    if (data.authenticated && data.user) {
      // Update auth store with latest user data
      useAuthStore.getState().setAuth(data.user, data.user.token || token);
      return { authenticated: true, user: data.user };
    }

    return { authenticated: false, user: null };
  } catch (err) {
    console.error("Auth verification failed:", err);
    return { authenticated: false, user: null };
  }
};

/**
 * Logout the user
 */
export const logout = async (): Promise<boolean> => {
  try {
    const { token } = useAuthStore.getState();

    // Call logout endpoint to clear cookies
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      credentials: "include", // Important for cookie operations
    });

    // Always clear local state, even if the API call fails
    useAuthStore.getState().logout();
    return true;
  } catch (err) {
    console.error("Logout failed:", err);
    // Still clear local state on error
    useAuthStore.getState().logout();
    return true;
  }
};
