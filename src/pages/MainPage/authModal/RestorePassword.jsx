import { AuthContext } from "../../../Context/AuthContext";
import Loading from "../../../components/Loader/Loading";

import styles from "./RestorePassword.module.css";

import { resetPassword } from "./authApi";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
const passwordRules = [
  { test: (pw) => pw.length >= 8, message: "Минимум 8 символов" },
  { test: (pw) => /[A-Z]/.test(pw), message: "Хотя бы одна заглавная буква" },
  { test: (pw) => /[a-z]/.test(pw), message: "Хотя бы одна строчная буква" },
  { test: (pw) => /\d/.test(pw), message: "Хотя бы одна цифра" },
];
const RestorePassword = () => {
  const { login } = useContext(AuthContext);
  const [password, setPassword] = useState("");
  const [rulesStatus, setRulesStatus] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const ref = useRef(null);
  const navigate = useNavigate();

  // Фокус на поле
  useEffect(() => {
    ref.current?.focus();
  }, []);

  // Проверка валидности ссылки
  useEffect(() => {
    if (!email || !token) {
      setError("Ссылка недействительна");
    }
  }, [email, token]);

  // Динамическая проверка правил пароля
  useEffect(() => {
    const status = passwordRules.map((rule) => ({
      message: rule.message,
      valid: rule.test(password),
    }));
    setRulesStatus(status);
  }, [password]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Проверяем, что все правила выполнены
    const invalidRule = rulesStatus.find((r) => !r.valid);
    if (invalidRule) {
      setError(`Пароль не соответствует правилу: ${invalidRule.message}`);
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword({
        email,
        token,
        newPassword: password,
      });

      if (result?.email) {
        login(result.email);
        setSuccess("Пароль успешно изменен!");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setError();
      }
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className={styles.containerRestorePassword}>
        <div className={styles.modal}>
          <p className={styles.lastReturn}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.containerRestorePassword}>
      <div className={styles.logo}></div>

      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {loading && <Loading />}
        <form autoComplete="off" onSubmit={handleReset}>
          <h2>Сброс пароля</h2>

          <label>
            Новый пароль <span>*</span>
          </label>
          <input
            ref={ref}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {/* Динамические правила */}
          <ul>
            {rulesStatus.map((rule, i) => (
              <li
                className={styles.containerList}
                key={i}
                style={{ color: rule.valid ? "green" : "red" }}
              >
                - {rule.message}
              </li>
            ))}
          </ul>

          {/* Ошибка/успех */}
          {error && (
            <p className={styles.error} style={{ color: "red" }}>
              {error}
            </p>
          )}
          {success && (
            <p className={styles.success} style={{ color: "green" }}>
              {success}
            </p>
          )}

          <button type="submit">Сбросить пароль</button>
        </form>
      </div>
    </div>
  );
};

export default RestorePassword;
