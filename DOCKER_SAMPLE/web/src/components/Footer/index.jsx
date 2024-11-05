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
import "./styles.scss";

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
    <div className="footer">
      <footer>
        <nav className="footer-nav">
          <Link to={"/"}>
            <div
              className={
                pathname === "/" ? "active footer-icon" : `footer-icon`
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
                  ? `active `
                  : ``
              }
            >
              <div
                className={
                  pathname === link?.route && link.route !== "/tutorials"
                    ? `active footer-icon ${!link.text ? "midd-icon" : ""}`
                    : `footer-icon ${!link.text ? "midd-icon" : ""}`
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
