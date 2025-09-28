import styles from "./Loading.module.css";

const Loading = () => {
  return (
    <div className={styles.containerOverlay}>
      <span className={styles.containerSpiner}></span>
    </div>
  );
};
export default Loading;
