// Library components
import { Link, useLocation } from "react-router-dom";
import useAuthentication from "hooks/useAuthentication";

// assets
import { ReactComponent as Bag } from "assets/icons/earn.svg";
import { ReactComponent as Spent } from "assets/icons/likes-dark.svg";
import { ReactComponent as Add } from "assets/icons/add.svg";
import { ReactComponent as Rank } from "assets/icons/rank.svg";
import { ReactComponent as Profile } from "assets/icons/profile-dark.svg";

// styles
import styles from "./styles.module.scss";

const links = [
  {
    icon: <Spent />,
    route: "/spent",
    text: "Spent",
  },
  {
    icon: <Add />,
    route: "/add",
    text: "",
  },
  {
    icon: <Rank />,
    route: "/ranks",
    text: "Ranks",
  },
  {
    icon: <Profile />,
    route: "/plebeian",
    text: "Profile",
  },
];

const Footer = () => {
  const { isAuthenticate, redirectToLogin } = useAuthentication();
  const { pathname } = useLocation();
  return (
    <div className={styles.footer}>
      <footer>
        <nav className={styles.footer_nav}>
          <Link to={"/"} className={pathname === "/" ? `active ` : ``}>
            <div
              className={
                pathname === "/"
                  ? `${styles.active} ${styles.footer_icon}  `
                  : styles.footer_icon
              }
            >
              <Bag />
            </div>
            <p>{"Earn"}</p>
          </Link>
          {links.map((link, index) => (
            <Link
              to={isAuthenticate ? link.route : redirectToLogin}
              key={index}
              className={
                pathname === link?.route && link.route !== "/tutorials"
                  ? styles.active
                  : ``
              }
            >
              <div
                className={
                  pathname === link?.route && link.route !== "/tutorials"
                    ? `${styles.active} ${styles.footer_icon}  ${
                        !link.text ? styles.midd_icon : ""
                      }`
                    : `${styles.footer_icon} ${
                        !link.text ? styles.midd_icon : ""
                      }`
                }
              >
                {link.icon}
              </div>
              <p>{link.text}</p>
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
};

export default Footer;
