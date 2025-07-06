import type { User, UserProfileResponse } from "../types";
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
      credentials: "include",
    });
    const data = await res.json();
    
    if (data.authenticated && data.user) {
      useAuthStore.getState().setAuth(data.user, data.user.token || token);
      return { authenticated: true, user: data.user };
    }
    
    // CRITICAL FIX: Use logout() to clear the store when authentication fails
    useAuthStore.getState().logout();
    return { authenticated: false, user: null };
    
  } catch (err) {
    console.error("Auth verification failed:", err);
    // ALSO clear store on network/server errors
    useAuthStore.getState().logout();
    return { authenticated: false, user: null };
  }
};
/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { token } = useAuthStore.getState();
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile/${userId}`, {
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` })
      },
      credentials: "include",
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch profile: ${res.status}`);
    }
    
    const data: UserProfileResponse = await res.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return null;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
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

    // Check if logout was successful
    if (!response.ok) {
      console.error('Server logout failed:', response.status);
      // Still clear local state even if server logout fails
    }

    // Always clear local state
    useAuthStore.getState().logout();
    return true;
  } catch (err) {
    console.error("Logout failed:", err);
    // Still clear local state on error
    useAuthStore.getState().logout();
    return true;
  }
};
