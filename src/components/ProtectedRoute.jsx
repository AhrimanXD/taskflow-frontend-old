import { Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { loggedIn, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
