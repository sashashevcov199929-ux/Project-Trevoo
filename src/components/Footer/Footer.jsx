import styles from "./Footer.module.css";
import { FaInstagram } from "react-icons/fa";

import { RiTelegram2Line } from "react-icons/ri";

const Footer = () => {
  return (
    <div className={styles.containerFooter}>
      <div>
        <a href="#">
          {" "}
          <RiTelegram2Line size={35} className={styles.containerIcon} />
        </a>{" "}
      </div>
    </div>
  );
};
export default Footer;
