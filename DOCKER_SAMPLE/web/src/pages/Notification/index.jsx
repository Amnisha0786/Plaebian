// Custom Components
import Header from "components/Header";

// Icons
import { ReactComponent as EmpowerersDark } from "assets/icons/empowerers-dark.svg";
import { ReactComponent as MoneyDark } from "assets/icons/money-bag-dark.svg";
import { ReactComponent as VideoIconDark } from "assets/icons/videos-icon-dark.svg";

// styles
import "./styles.scss";

const Notification = () => {
  return (
    <>
      <Header />
      <div className="notifications">
        <div className="noti-title">
          <h2>Notification</h2>
        </div>
        <div className="noti-main">
          <div className="noti-box">
            <div className="noti-img">
              <VideoIconDark />
            </div>
            <div className="noti-contents">
              <h5>You need to enable JavaScript app.</h5>
              <p>Date 05-jan-2022</p>
            </div>
          </div>

          <div className="noti-box">
            <div className="noti-img">
              <VideoIconDark />
            </div>
            <div className="noti-contents">
              <h5>You need to enable JavaScript app.</h5>
              <p>Date 05-jan-2022</p>
            </div>
          </div>

          <div className="noti-box">
            <div className="noti-img">
              <EmpowerersDark />
            </div>
            <div className="noti-contents">
              <h5>You need to enable JavaScript app.</h5>
              <p>Date 05-jan-2022</p>
            </div>
          </div>

          <div className="noti-box">
            <div className="noti-img">
              <MoneyDark />
            </div>
            <div className="noti-contents">
              <h5>You need to enable JavaScript app.</h5>
              <p>Date 05-jan-2022</p>
            </div>
          </div>
          <div className="noti-box">
            <div className="noti-img">
              <VideoIconDark />
            </div>
            <div className="noti-contents">
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
