import { useContext, useState, useEffect, useRef } from "react";
/* */
import styles from "./AuthModal.module.css";
/* */
import { motion } from "framer-motion";
/* */
import { authUser } from "./authApi";
/* */
import { useNavigate } from "react-router-dom";
/* */
import { AuthContext } from "../../../Context/AuthContext";
/* */
import api from "../../../interceptor/api";

/* -------------------------------------------------------------------------------*/
const AuthModal = () => {
  /* */
  const { login } = useContext(AuthContext);
  /* */
  const [info, setInfo] = useState(1);
  /* */
  const [errorInfo, setErrorInfo] = useState(0);
  const [message, setMessage] = useState({ error: null, success: null });
  /* */
  const [auth, setAuth] = useState({
    email: "",
    password: "",
  });
  /* -------------------------------------------------------------------------------*/

  const ref = useRef();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setAuth({ ...auth, [e.target.id]: e.target.value });
    if (errorInfo === 1) {
      setErrorInfo(0);
      setMessage({ error: null, success: null });
    }
  };
  /* Авторизация */
  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage({ error: null, success: null });

    const results = await authUser(auth);
    console.log("Email", results);
    console.log("Ответ пароль", results.error);
    if (results && results.token) {
      console.log(results);
      console.log(results.username);
      login(results.token);
      navigate("/dashboard", { replace: true });
      console.log("Вы успешно вошли");
      setMessage({ error: null, success: "Вы успешно вошли" });
    } else {
      console.log("ошибка", results);
      setMessage({ error: results.error, success: null });
      setErrorInfo(1);
    }
  };
  /*Reset пароля  */
  const handleReset = async (e) => {
    e.preventDefault();
    const email = auth.email.trim();
    if (!email) {
      console.log("Поле email пустое!");
      setErrorInfo(1);
      setMessage({
        error: "Обязательно введите e-mail, чтобы восстановить пароль",
        success: null,
      });

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      console.log("Email некорректный");
      setErrorInfo(1);
      setMessage({ error: "Некорректный Email", success: null });
      return;
    }
    setInfo(2);
    try {
      const response = await api.post("/restore-password", {
        email: auth.email,
      });
      setMessage({ error: null, success: null });
      console.log("fdsfsd", response.data);
    } catch (err) {
      setMessage({ error: err.response.data, success: null });
      console.log("ошибка" + err.response.data);
    }
  };

  return (
    <div className={styles.overlay}>
      <div onClick={() => navigate("/")} className={styles.logo}></div>
      {info == 2 && (
        <div className={styles.overlayInfo}>
          <motion.div
            initial={{ y: -80, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -50, scale: 0.9 }}
            transition={{}}
            className={styles.modalInfo}
          >
            <p className={styles.textInfo}>
              Инуструкция отправлена на вашу почту!
            </p>
            <span className={styles.subText}>
              Мы выслали письмо на адрес, который вы указали при регистрации.
              Проверьте почтовый ящик и следуйте инструкции внутри.
            </span>
            <span
              onClick={() => {
                setInfo(1);
              }}
              className={styles.buttonInfo}
            >
              Окей
            </span>
          </motion.div>
        </div>
      )}
      {info == 1 && (
        <motion.div
          initial={{ y: -80, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: -50, scale: 0.9 }}
          transition={{}}
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          onAnimationComplete={() => {
            if (ref.current) ref.current.focus();
          }}
        >
          <span className={styles.closeBtn} onClick={() => navigate("/")}>
            x
          </span>
          <h2>С возвращением!</h2>
          {errorInfo === 1 && message.error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className={styles.error}
            >
              {message.error}
            </motion.div>
          )}
          <form onSubmit={handleAuth}>
            <label htmlFor="email">
              Адрес электронной почты
              <span className={styles.containerRequired}> *</span>
            </label>

            <input
              ref={ref}
              value={auth.email}
              type="email"
              id="email"
              required
              onChange={handleChange}
              autoComplete="newEmail"
            />

            <label htmlFor="password">
              Пароль <span className={styles.containerRequired}> *</span>
            </label>
            <input
              value={auth.password}
              onChange={handleChange}
              type="password"
              id="password"
              required
            />

            <button
              className={styles.buttonReset}
              onClick={handleReset}
              type="button"
            >
              Забыли пароль?
            </button>

            <button className={styles.btnSubmit} type="submit">
              Вход
            </button>
          </form>
          <p>
            Нету аккаунта?
            <span
              className={styles.containerSwitch}
              onClick={() => navigate("/register")}
            >
              Создать учетную запись
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AuthModal;
