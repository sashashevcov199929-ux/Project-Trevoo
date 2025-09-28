import styles from "./CustomSelect.module.css";
import { useState, useRef, useEffect } from "react";
export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.customSelectContainer} ref={containerRef}>
      <div className={styles.customSelectHeader} onClick={() => setOpen(!open)}>
        {value || placeholder}
        <span className={styles.arrow}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className={`${styles.customSelectOptions} ${styles.dropUp}`}>
          {options.map((opt, idx) => (
            <div
              key={idx}
              className={styles.customSelectOption}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
