import styles from "./ButtonExit.module.css";
import { logout } from "./ApiButtonExit";
import { useNavigate } from "react-router-dom";
import { tokenManager } from "../../../interceptor/api";
import { useContext } from "react";
import { AuthContext } from "../../../Context/AuthContext";

const ButtonExit = () => {
  const { logoutExit } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleExit = async () => {
    try {
      await logout();
      logoutExit(false);
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    } finally {
      navigate("/");
      console.log("Exit");
    }
  };
  return (
    <button className={styles.containerBtnExit} onClick={handleExit}>
      Выйти
    </button>
  );
};
export default ButtonExit;
