import styles from "./Header.module.css";
import { motion } from "framer-motion";

import ButtonAuth from "../ButtonAuth/ButtonAuth";

const Header = () => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerLogo}>
        <div className={styles.logo}></div>
      </div>
      <div>
        <ButtonAuth />
      </div>
    </div>
  );
};
export default Header;
