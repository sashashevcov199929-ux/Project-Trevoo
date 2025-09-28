/* */
import Header from "./../../components/Header/Header";
import Footer from "./../../components/Footer/Footer";
import MainDiv from "../../components/MainDiv/MainIDiv";

/* */
import styles from "./MainPage.module.css";

const MainPage = () => {
  return (
    <div className={styles.containerMainPage}>
      <Header />

      <MainDiv />

      <Footer />
    </div>
  );
};

export default MainPage;
