import { useEffect, useState } from "react";
import styles from "./MainDiv.module.css";
import { GrInfo } from "react-icons/gr";

const MainDiv = () => {
  const [info, setInfo] = useState(false);
  const [text, setText] = useState("");
  useEffect(() => {
    if (info) {
      const timer = setTimeout(() => {
        setText(
          `1.УВАЖАЙТЕ ДРУГИХ ПОЛЬЗОВАТЕЛЕЙ
           > Не допускается оскорбительное поведение, троллинг, 
            буллинг или угрозы.
           > Общение должно быть дружелюбным и уважительным.
2.ЗАПРЕЩЕН НЕПРИЕМЛЕМЫЙ КОНТЕНТ
           > Нельзя публиковать материалы сексуального характера, 
           насилия, дискриминации, наркотиков или других запрещённых 
           вещей.
           > Не публикуйте личные данные других пользователей без их 
           согласия.
3.ИСППОЛЬЗУЙТЕ РЕАЛЬНЫЙ ДАННЫЕ
           > Для регистрации используйте свой действующий email.
           > Не создавайте фейковые аккаунты с целью обмана других.
4.БЕЗ СПАМА И РЕКЛАМЫ
           > Запрещено массовое рассылание сообщений, 
           ссылки на сторонние ресурсы без разрешения. 
           > Реклама услуг или товаров возможна только с согласия  
           администрации.       
           `
        );
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [info]);
  return (
    <div className={styles.containerMainDiv}>
      <div className={styles.content}>
        <div
          className={styles.contentInfo}
          onMouseEnter={() => setInfo(true)}
          onMouseLeave={() => {
            setInfo(false);
            setText("");
          }}
        >
          {info && <h2>Правила Trovee</h2>}
          <GrInfo className={styles.containerIcon} />
          {info && (
            <div className={styles.containerInInfo}>
              <div className={styles.containerInInfoOne}>{text}</div>
              <div className={styles.containerInInfoToo}>1</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default MainDiv;
