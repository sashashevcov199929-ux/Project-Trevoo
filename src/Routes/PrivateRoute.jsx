import { Navigate, replace } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { useContext } from "react";
import Loading from "../components/Loader/Loading";
import { tokenManager } from "../interceptor/api";
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const info = user;
  console.log("Приходит ли сюда user", info);
  if (loading) {
    return <Loading />;
  }

  if (!user) {
    tokenManager.destroy();
    console.log("ExitLast", user);
    return <Navigate to="/" replace />;
  }

  return children;
};
export default PrivateRoute;
