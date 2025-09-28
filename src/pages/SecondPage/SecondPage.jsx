import MainPanel from "./BigComponents/MainPanel/MainPanel";
import { ServerProvider } from "./BigComponents/TopPanel/OwnerListServers/ServerProvider";
import TopPanel from "./BigComponents/TopPanel/TopPanel";
import styles from "./SecondPage.module.css";

const SecondPage = () => {
  return (
    <ServerProvider>
      <div className={styles.containerSecondPage}>
        <TopPanel />
        <MainPanel />
      </div>
    </ServerProvider>
  );
};
export default SecondPage;
