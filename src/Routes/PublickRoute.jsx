import { Children, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Navigate } from "react-router-dom";

const PublickRouter = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (user) return <Navigate to="/dashboard" />;

  return children;
};
export default PublickRouter;
