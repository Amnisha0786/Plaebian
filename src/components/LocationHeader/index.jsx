import React from "react";

// libraries
import { Link, useLocation } from "react-router-dom";
import Select from "react-select";

// assets
import locationsIcon from "assets/icons/locations.png";
import { ReactComponent as Fort } from "assets/icons/Location_4_Gladiator_A.svg";
import { ReactComponent as Crown } from "assets/icons/title.svg";

// styles
import styles from "./styles.module.scss";

const LocationHeader = ({ locations, handleLocationChange, value }) => {
  const { pathname } = useLocation();

  return (
    <header className={`${styles.home_header} ${styles.titles}`}>
      <nav>
        <div
          className={
            pathname === "/locationProfile"
              ? `${styles.active} ${styles.header_icon} ${styles.king_icon}`
              : `${styles.header_icon} ${styles.king_icon}`
          }
        >
          <Link to={"/locationProfile"}>
            <Fort />
          </Link>
        </div>
        <div className={`${styles.d_flex} ${styles.selects_options}`}>
          <img src={locationsIcon} alt="locations" />
          <Select
            options={locations}
            placeholder="Search Location"
            onChange={handleLocationChange}
            maxMenuHeight={150}
            value={value}
          />
        </div>
        <div
          className={
            pathname === "/coinBank"
              ? // "/titles"
                `${styles.active} ${styles.header_icon} ${styles.king_icon}`
              : `${styles.header_icon} ${styles.king_icon}`
          }
        >
          {/* <Link to="/titles"> */}
          <Link to="/coinBank">
            <Crown />
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default LocationHeader;
