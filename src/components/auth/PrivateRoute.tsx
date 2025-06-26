import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // We will create this context next

interface PrivateRouteProps {
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    // This should ideally not happen if AuthProvider is set up correctly
    console.error("AuthContext is not available");
    return <Navigate to="/login" replace />;
  }

  const { user, loading } = authContext;

  if (loading) {
    // You can return a loading spinner here if needed
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
