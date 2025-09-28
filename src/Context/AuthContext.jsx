import { createContext, useEffect, useState } from "react";
import { Redirect } from "./RedirectApi";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loader/Loading";
import { tokenManager } from "../interceptor/api";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        const res = await Redirect();

        console.log("притвет", res);
        if (res) {
          setUser(res);
          navigate("/dashboard", { replace: true });
          tokenManager.init();
          console.log("gjdfjgf", res);
        } else {
          tokenManager.destroy();
        }
      } catch (err) {
        console.log("Ошибка в checkAuth:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (formData) => {
    if (formData) {
      setUser(formData);
      tokenManager.init();
    }
  };
  const logoutExit = (boolean) => {
    setUser(boolean);
    console.log("булианAuth", boolean);
  };

  if (loading) {
    return <Loading />;
  }

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    login,
    logoutExit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
