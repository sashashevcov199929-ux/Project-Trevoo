import styles from "./RegisterModal.module.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser } from "./authApi";
import { useContext, useRef, useState, useCallback, useEffect } from "react";
import { AuthContext } from "../../../Context/AuthContext";

import api from "../../../interceptor/api";
import Loading from "../../../components/Loader/Loading";
import CustomSelect from "../../../components/CustomSelect/CustomSelect";
import OTPInput from "../../../components/OTPInput/OTPInput";

// Начальное состояние формы
const initialFormState = {
  username: "",
  displayName: "",
  email: "",
  password: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
};

const RegisterModal = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const ref = useRef(null);
  const refOtp = useRef(null);

  const [form, setForm] = useState(initialFormState);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState({ error: {}, success: null });
  const [emailOtp, setEmailOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpState, setOtpState] = useState({
    attempts: 0,
    maxAttempts: 3,
    cooldown: 0,
    canResend: true,
    ttl: 300,
  });
  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  // ------------------- handleChange -------------------
  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setMessage({ error: {}, success: null });
  }, []);

  // ------------------- validateForm -------------------
  const validateForm = (data) => {
    const errors = {};
    const {
      username,
      displayName,
      email,
      password,
      birthDay,
      birthMonth,
      birthYear,
    } = data;

    if (!username.trim()) {
      errors.username = "Имя пользователя обязательно";
    } else if (!/^[a-zA-Z0-9._]{3,20}$/.test(username)) {
      errors.username =
        "Имя пользователя должно быть 3-20 символов, латиница, цифры, точки и подчеркивания";
    }

    if (!displayName.trim()) {
      errors.displayName = "Отображаемое имя обязательно";
    }

    if (!email.trim()) {
      errors.email = "Email обязателен";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      errors.email = "Email некорректен";
    }

    if (!password.trim()) {
      errors.password = "Пароль обязателен";
    } else if (password.length < 8) {
      errors.password = "Пароль должен быть не менее 8 символов";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password =
        "Пароль должен содержать хотя бы одну заглавную букву, одну строчную и одну цифру";
    }

    if (!birthDay || !birthMonth || !birthYear) {
      errors.dateOfBirth = "Дата рождения обязательна";
    } else {
      const dob = new Date(birthYear, birthMonth - 1, birthDay);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      if (
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      ) {
        age--;
      }
      if (age < 13) {
        errors.dateOfBirth =
          "Регистрация доступна только пользователям старше 13 лет";
      }
    }

    return errors;
  };

  // ------------------- handleRegister -------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);

    if (Object.keys(errors).length > 0) {
      setMessage({ error: errors, success: null });
      return;
    }

    const payload = {
      ...form,
      dateOfBirth: `${String(form.birthYear).padStart(4, "0")}-${String(
        form.birthMonth
      ).padStart(2, "0")}-${String(form.birthDay).padStart(2, "0")}`,
    };

    setLoading(true);
    try {
      const results = await registerUser(payload);
      if (results.success) {
        setEmailOtp(results.data.email);
        setStep(2);
        setForm(initialFormState);
      } else {
        setMessage({
          error: results.error || { general: "Ошибка регистрации" },
          success: null,
        });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setMessage({
          error: { general: "Пользователь уже существует" },
          success: null,
        });
      } else if (error.response?.status >= 500) {
        setMessage({
          error: { general: "Сервер временно недоступен" },
          success: null,
        });
      } else {
        setMessage({
          error: { general: "Произошла непредвиденная ошибка" },
          success: null,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------- handleVerifyOtp -------------------
  // Таймер для cooldown и TTL
  useEffect(() => {
    const timer = setInterval(() => {
      setOtpState((prev) => {
        const newState = { ...prev };
        if (prev.cooldown > 0) newState.cooldown--;
        if (prev.ttl > 0) newState.ttl--;
        if (prev.ttl <= 0) newState.canResend = true;
        return newState;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Проверяем статус OTP при переходе на шаг 2
  useEffect(() => {
    if (step === 2 && emailOtp) {
      checkOtpStatus();
    }
  }, [step, emailOtp]);

  const checkOtpStatus = async () => {
    try {
      const response = await api.get(`/register/otp-status?email=${emailOtp}`);
      setOtpState((prev) => ({
        ...prev,
        attempts: response.data.attempts || 0,
        ttl: response.data.ttlSeconds || 300,
        canResend: response.data.canResend !== false,
      }));
    } catch (error) {
      console.error("Ошибка проверки статуса OTP:", error);
    }
  };

  const handleResendOtp = async () => {
    if (!otpState.canResend || otpState.cooldown > 0) return;

    setLoading(true);
    try {
      const res = await api.post("/register/resend-otp", { email: emailOtp });
      const cooldown = res.data.cooldownSeconds ?? 60;
      setOtpState((prev) => ({
        ...prev,
        cooldown,
        attempts: 0,
        ttl: 300,
        canResend: false,
      }));
      setMessage({ error: {}, success: "Новый код отправлен на email" });
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Ошибка отправки кода";
      setMessage({ error: { general: errorMsg }, success: null });

      if (error.response?.data?.message?.includes("через")) {
        setOtpState((prev) => ({ ...prev, cooldown: 60 }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setMessage({
        error: { general: "Введите 6-значный код" },
        success: null,
      });
      return;
    }

    if (otpState.attempts >= otpState.maxAttempts) {
      setMessage({
        error: { general: "Превышено количество попыток" },
        success: null,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/register/verify", {
        email: emailOtp,
        otp: otp,
      });

      setStep(0);
      login(res.data.email);
      setMessage({ error: {}, success: "Регистрация успешно завершена!" });

      setTimeout(() => navigate("/dashboard", { replace: false }), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Ошибка верификации";
      const attemptsLeft = otpState.maxAttempts - otpState.attempts - 1;

      setMessage({
        error: { general: errorMsg },
        success: null,
      });

      setOtpState((prev) => ({
        ...prev,
        attempts: prev.attempts + 1,
      }));

      // Автоматически запрашиваем статус после ошибки
      if (attemptsLeft > 0) {
        setTimeout(checkOtpStatus, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div onClick={() => navigate("/")} className={styles.logo}></div>

      {loading && <Loading />}

      {message.error && Object.keys(message.error).length > 0 && (
        <motion.div
          key="all-errors"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={styles.error}
        >
          {Object.entries(message.error).map(([field, errorMsg]) => (
            <p key={field} className={styles.errorText}>
              {errorMsg}
            </p>
          ))}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="register"
            initial={{ y: -80, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            transition={{}}
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onAnimationComplete={() => ref.current?.focus()}
          >
            <span className={styles.closeBtn} onClick={() => navigate("/")}>
              x
            </span>
            <h2>Новая учетная запись</h2>
            <form onSubmit={handleRegister}>
              <label htmlFor="username">
                Имя пользователя
                <span className={styles.containerRequired}> *</span>
              </label>
              <input
                ref={ref}
                id="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="new-username"
              />

              <label htmlFor="displayName">Имя на сайте (отображаемое)</label>
              <input
                id="displayName"
                value={form.displayName}
                onChange={handleChange}
                autoComplete="newDisplayName"
              />

              <label htmlFor="email">
                E-mail<span className={styles.containerRequired}> *</span>
              </label>
              <input
                id="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />

              <label htmlFor="password">
                Пароль<span className={styles.containerRequired}> *</span>
              </label>
              <input
                type="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

              <label>
                Дата рождения
                <span className={styles.containerRequired}> *</span>
              </label>
              <div className={styles.containerBirthDay}>
                <CustomSelect
                  options={[...Array(31)].map((_, i) => i + 1)}
                  value={form.birthDay}
                  onChange={(val) =>
                    handleChange({ target: { id: "birthDay", value: val } })
                  }
                  placeholder="День"
                />
                <CustomSelect
                  options={months}
                  value={months[form.birthMonth - 1] || ""}
                  onChange={(val) =>
                    handleChange({
                      target: {
                        id: "birthMonth",
                        value: (months.indexOf(val) + 1).toString(),
                      },
                    })
                  }
                  placeholder="Месяц"
                />
                <CustomSelect
                  options={Array.from(
                    { length: 100 },
                    (_, i) => new Date().getFullYear() - i
                  )}
                  value={form.birthYear}
                  onChange={(val) =>
                    handleChange({ target: { id: "birthYear", value: val } })
                  }
                  placeholder="Год"
                />
              </div>

              <button type="submit">Создать</button>
            </form>

            <p className={styles.haveAccount}>
              Есть аккаунт?
              <span
                className={styles.containerSpan}
                onClick={() => navigate("/login")}
              >
                Войти
              </span>
            </p>
          </motion.div>
        )}

        {step === 2 && !loading && (
          <motion.div
            key="otp"
            initial={{ y: -80, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -50, scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.modalOtp}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Подтверждение e-mail</h2>
            <form onSubmit={handleVerifyOtp}>
              <label>
                Введите код подтверждения, отправленный на почту:{" "}
                <p className={styles.emailName}>{emailOtp}</p>
              </label>
              <OTPInput
                value={otp}
                onChange={setOtp}
                length={6}
                disabled={otpState.attempts >= otpState.maxAttempts}
              />
              <div
                className={`${styles.otpInfo} ${
                  otpState.attempts >= otpState.maxAttempts - 1
                    ? styles.danger
                    : otpState.attempts > 0
                    ? styles.warning
                    : ""
                }`}
              >
                <p>
                  Время:{" "}
                  <span className={styles.timer}>
                    {Math.floor(otpState.ttl / 60)}:
                    {(otpState.ttl % 60).toString().padStart(2, "0")}
                  </span>
                </p>
                <p>
                  Попытки:{" "}
                  <span className={styles.attempts}>
                    {otpState.attempts}/{otpState.maxAttempts}
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  otp.length !== 6 || otpState.attempts >= otpState.maxAttempts
                }
                className={styles.verifyButton}
              >
                {otpState.attempts >= otpState.maxAttempts
                  ? " Превышено попыток"
                  : " Подтвердить"}
              </button>

              {/* Обновленная секция повторной отправки */}
              <div className={styles.resendSection}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpState.cooldown > 0 || !otpState.canResend}
                  className={styles.resendButton}
                >
                  {otpState.cooldown > 0 ? (
                    <> Отправить через {otpState.cooldown}с</>
                  ) : (
                    <> Отправить код повторно</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {step === 0 && message.success && (
        <p className={styles.containerMessageSuccess}>{message.success}</p>
      )}
    </div>
  );
};

export default RegisterModal;
