// hooks
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// assets
import { ReactComponent as Fort } from "assets/icons/Location_4_Gladiator_A.svg";
import { ReactComponent as Crown } from "assets/icons/emperor.svg";

// styles
import styles from "./styles.module.scss";

const HomeHeader = ({ text, className, onClickText = () => {} }) => {
  const user = useSelector((state) => state.user.value);

  const navigate = useNavigate();

  const handleLocationsClick = () => {
    if (!user?.token) {
      navigate("/login");
      return;
    }

    navigate("/locationProfile");
  };

  const handleTitlesClick = () => {
    if (!user?.token) {
      navigate("/login");
      return;
    }
    navigate("/coinBank");
    // navigate("/titles");
  };

  return (
    <header className={styles.home_header}>
      <nav>
        <div
          className={`${styles.header_icon} ${styles.king_icon}`}
          onClick={handleLocationsClick}
        >
          <Fort />
        </div>
        <p onClick={onClickText} className={className ?? " "}>
          {text}
        </p>
        <div
          className={`${styles.header_icon} ${styles.king_icon}`}
          onClick={handleTitlesClick}
        >
          <Crown />
        </div>
      </nav>
    </header>
  );
};

export default HomeHeader;
