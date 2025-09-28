import { useEffect, useRef, useState } from "react";
import styles from "./CreateServer.module.css";
import { IoMdAdd } from "react-icons/io";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../../../../../interceptor/api";
import { useServer } from "../ServerProvider";

const CreateServer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [nameServer, setNameServer] = useState("");
  const [message, setMessage] = useState({ error: null, success: null });
  const { addServer } = useServer();
  //----------------------------------------- */
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [isOpen]);
  //----------------------------------------- */
  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };
  //----------------------------------------- */
  const handleChange = (e) => {
    setNameServer(e.target.value);
  };
  //----------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/create-server", {
        serverName: nameServer,
      });
      addServer(response?.data);
      console.log("Server", response);
    } catch (err) {
      console.log("ошикба ", err.response?.data);
      setMessage({ error: err.response?.data, success: null });
    }
  };

  return (
    <div className={styles.containerCreateServer}>
      <IoMdAdd className={styles.iconCreate} onClick={open} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.overlay}
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Создать сервер</h2>
              <p>
                Введите название нового сервера и настройте его, чтобы начать
                общение с друзьями или командой.
              </p>
              <form onSubmit={handleSubmit}>
                <label>
                  Название сервера
                  <span className={styles.containerRequired}> *</span>
                </label>
                {message.error?.serverName && (
                  <p className={styles.error}>{message.error.serverName}</p>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  onChange={handleChange}
                  value={nameServer}
                />
                <div className={styles.containerBtnAndSpan}>
                  <span className={styles.nazad} onClick={close}>
                    Назад
                  </span>
                  <button type="submit" className={styles.btnSubmit}>
                    Создать
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CreateServer;
