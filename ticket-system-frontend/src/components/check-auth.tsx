import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface AuthRouteProps {
  protectedRoute: boolean;
  children: React.ReactNode;
}

const CheckAuth: React.FC<AuthRouteProps> = ({ children, protectedRoute }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
          method: "GET",
          credentials: "include", // Send cookies
        });

        const data = await res.json();

        if (protectedRoute && !data.authenticated) {
          navigate("/login");
        } else if (!protectedRoute && data.authenticated) {
          navigate("/");
        } else {
          setLoading(false);
        }

      } catch (err) {
        console.error("Auth check failed:", err);
        if (protectedRoute) {
          navigate("/login");
        } else {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [navigate, protectedRoute]);

  
  if (loading) {
    return (
      <div>Loading...</div>
    )
  } else {
    return children;
  }
}

export default CheckAuth;
