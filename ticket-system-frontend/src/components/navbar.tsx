import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import type { User } from "../types";
import { verifyAuth, logout as logoutUser } from "../utils/auth";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }

    // Verify authentication status with backend
    const checkAuth = async () => {
      const { authenticated, user: authUser } = await verifyAuth();
      setIsAuthenticated(authenticated);
      if (authenticated && authUser) {
        setUser(authUser);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    const success = await logoutUser();
    if (success) {
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    }
  };

  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Ticket AI
        </Link>
      </div>
      <div className="flex gap-2">
        {!isAuthenticated ? (
          <>
            <Link to="/signup" className="btn btn-sm">
              Signup
            </Link>
            <Link to="/login" className="btn btn-sm">
              Login
            </Link>
          </>
        ) : (
          <>
            <p>Hi, {user?.email}</p>
            {user && user?.role === "admin" ? (
              <Link to="/admin" className="btn btn-sm">
                Admin
              </Link>
            ) : null}
            <button onClick={logout} className="btn btn-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
