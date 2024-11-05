import React from "react";

// libraries
import { Link, useLocation } from "react-router-dom";
import Select from "react-select";

// assets
import locationsIcon from "assets/icons/locations.png";
import { ReactComponent as Fort } from "assets/icons/Location_4_Gladiator_A.svg";
import { ReactComponent as Crown } from "assets/icons/title.svg";

// styles
import "./styles.scss";

const LocationHeader = ({ locations, handleLocationChange, value }) => {
  const { pathname } = useLocation();

  return (
    <header className="home-header titles">
      <nav>
        <div
          className={
            pathname === "/locationProfile"
              ? "active header-icon king_icon"
              : `header-icon king_icon`
          }
        >
          <Link to={"/locationProfile"}>
            <Fort />
          </Link>
        </div>
        <div className="d-flex selects_options">
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
            pathname === "/titles"
              ? "active header-icon king_icon"
              : `header-icon king_icon`
          }
        >
          <Link to="/titles">
            <Crown />
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default LocationHeader;
