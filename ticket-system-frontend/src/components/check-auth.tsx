import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { verifyAuth } from "../utils/auth";

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
        const { authenticated } = await verifyAuth();

        if (protectedRoute && !authenticated) {
          navigate("/login");
        } else if (!protectedRoute && authenticated) {
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