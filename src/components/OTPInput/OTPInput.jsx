import { useRef, useEffect } from "react";
import styles from "./OTPInput.module.css";

const OTPInput = ({ value, onChange, length = 6, disabled = false }) => {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (inputsRef.current[0] && value === "") {
      inputsRef.current[0].focus();
    }
  }, [value]);

  const handleChange = (e, index) => {
    const input = e.target.value;

    // Разрешаем только цифры
    if (!/^\d*$/.test(input)) return;

    const newValue = value.split("");
    newValue[index] = input.slice(-1); // Берем последний введенный символ
    const combinedValue = newValue.join("");

    onChange(combinedValue);

    // Авто-фокус на следующее поле
    if (input && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    if (pastedData.length === length) {
      onChange(pastedData);
    }
  };

  return (
    <div className={styles.otpContainer} onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength="1"
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={disabled}
          className={styles.otpInput}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default OTPInput;
