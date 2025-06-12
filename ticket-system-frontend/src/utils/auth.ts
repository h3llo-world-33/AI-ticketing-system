import type { User } from "../types";

/**
 * Authentication utility functions
 */

/**
 * Get the current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (err) {
    console.error("Error parsing user from localStorage:", err);
    return null;
  }
};

/**
 * Get auth token from user object in localStorage
 */
export const getAuthToken = (): string => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return "";
  
  try {
    const userData = JSON.parse(userStr);
    return userData.token || "";
  } catch (err) {
    console.error("Error getting token:", err);
    return "";
  }
};

/**
 * Verify authentication status with the backend
 */
export const verifyAuth = async (): Promise<{authenticated: boolean, user: User | null}> => {
  try {
    // Get token for fallback
    const token = getAuthToken();
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
      method: "GET",
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      credentials: "include", // Send cookies
    });

    const data = await res.json();
    
    if (data.authenticated && data.user) {
      // Update localStorage with latest user data
      localStorage.setItem("user", JSON.stringify(data.user));
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
    // Get token for fallback
    const token = getAuthToken();
    
    // Call logout endpoint to clear cookies
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      credentials: "include",
    });
    
    // Clear local storage
    localStorage.removeItem("user");
    return true;
  } catch (err) {
    console.error("Logout failed:", err);
    return false;
  }
};