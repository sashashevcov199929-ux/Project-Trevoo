import { useNavigate } from "react-router-dom";
import styles from "./ButtonAuth.module.css";

const ButtonAuth = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.containerMainDiv}>
      <div className={styles.containerBtn} onClick={() => navigate("/login")}>
        <button>Войти</button>
      </div>
      <div
        className={styles.containerBtnTwo}
        onClick={() => navigate("/register")}
      >
        <button>Регистрация</button>
      </div>
    </div>
  );
};
export default ButtonAuth;
