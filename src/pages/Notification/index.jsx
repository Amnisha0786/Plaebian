// Custom Components
import Header from "components/Header";

// Icons
import { ReactComponent as EmpowerersDark } from "assets/icons/empowerers-dark.svg";
import { ReactComponent as MoneyDark } from "assets/icons/money-bag-dark.svg";
import { ReactComponent as VideoIconDark } from "assets/icons/videos-icon-dark.svg";

// styles
import styles from "./styles.module.scss";

const Notification = () => {
  return (
    <>
      <Header />
      <div className={styles.notifications}>
        <div className={styles.noti_title}>
          <h2>Notification</h2>
        </div>
        <div className={styles.noti_main}>
          <div className={styles.noti_box}>
            <div className={styles.noti_img}>
              <VideoIconDark />
            </div>
            <div className={styles.noti_contents}>
              <h5>You need to enable JavaScript app.</h5>
              <p>Date 05-jan-2022</p>
            </div>
          </div>

          <div className={styles.noti_box}>
            <div className={styles.noti_img}>
              <VideoIconDark />
            </div>
            <div className={styles.noti_contents}>
              <h5>You need to enable JavaScript app.</h5>
              <p>Date 05-jan-2022</p>
            </div>
          </div>

          <div className={styles.noti_box}>
            <div className={styles.noti_img}>
              <EmpowerersDark />
            </div>
            <div className={styles.noti_contents}>
              <h5>You need to enable JavaScript app.</h5>
              <p>Date 05-jan-2022</p>
            </div>
          </div>

          <div className={styles.noti_box}>
            <div className={styles.noti_img}>
              <MoneyDark />
            </div>
            <div className={styles.noti_contents}>
              <h5>You need to enable JavaScript app.</h5>
              <p>Date 05-jan-2022</p>
            </div>
          </div>
          <div className={styles.noti_box}>
            <div className={styles.noti_img}>
              <VideoIconDark />
            </div>
            <div className={styles.noti_contents}>
              <h5>You need to enable JavaScript app.</h5>
              <p>Date 05-jan-2022</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notification;
