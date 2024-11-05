// Library components
import { Link } from "react-router-dom";

// assets
import { ReactComponent as Comments } from "assets/icons/comments.svg";
import { ReactComponent as NotificationBell } from "assets/icons/notification-bell.svg";
import { ReactComponent as Setting } from "assets/icons/setting.svg";
import { ReactComponent as Fort } from "assets/icons/Location_2_Legionary_A.svg";

// styles
import styles from "./styles.module.scss";

const navLinks = [
  {
    SVG: <Fort />,
    path: "/tutorials",
  },
  {
    SVG: <Comments />,
    path: "/tutorials",
  },
  {
    SVG: <Setting />,
    path: "/settings",
  },
  {
    SVG: <NotificationBell />,
    path: "/tutorials",
  },
];

const Header = () => {
  return (
    <header>
      <nav>
        {navLinks.map((link, index) =>
          link.path ? (
            <Link to={link.path} key={index} className={styles.header_icon}>
              {link.SVG}
            </Link>
          ) : (
            <div className={styles.header_icon} key={index}>
              {link.SVG}
            </div>
          )
        )}
      </nav>
    </header>
  );
};

export default Header;
