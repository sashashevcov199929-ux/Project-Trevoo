import CreateServer from "./CreateServer/CreateServer";
import styles from "./OwnerListServers.module.css";
import { useServer } from "./ServerProvider";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

const OwnerListServers = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      container.scrollBy({
        left: e.deltaY * 2, // вертикальное колесо → горизонтальный скролл
        behavior: "smooth", // делает прокрутку плавной
      });
    };

    container.addEventListener("wheel", handleWheel);

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);
  const { servers } = useServer();
  return (
    <div className={styles.containerOwnerList}>
      <CreateServer />
      <div ref={containerRef} className={styles.containerListServerName}>
        {servers.map((server) => (
          <motion.div
            initial={{ x: -50, opacity: 0 }} // стартовая позиция слева
            animate={{ x: 0, opacity: 1 }} // конечная позиция
            transition={{
              duration: 0.1, // время анимации
            }}
            className={styles.containerServerName}
            key={server.publicId}
          >
            {server.serverName}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default OwnerListServers;
