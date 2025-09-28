import FriendsListServers from "./FriendsListServers/FriendsListServers";
import OwnerListServers from "./OwnerListServers/OwnerListServers";
import styles from "./TopPanel.module.css";

const TopPanel = () => {
  return (
    <div className={styles.containerTopPanel}>
      <OwnerListServers />
      <div className={styles.logo}>3</div>
      <FriendsListServers />
    </div>
  );
};
export default TopPanel;
