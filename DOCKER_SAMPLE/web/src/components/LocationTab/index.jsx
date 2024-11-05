import { useEffect, useState } from "react";

// custom components
import LocationIcon from "components/LocationIcon";
import UserDetailCard from "../userDetailCard";

// api
import { API_END_POINTS } from "common/apiConstants";
import { getRequest } from "helper/api";

// images
import imgpro from "assets/images/imgpro.png";

// config
import { IMAGE_URL } from "config";

// utils
import { getFollowerCount } from "common/utils";

//styles
import "../../pages/Locations/styles.scss"

const LocationTab = ({
  setDisableTab,
  setActiveTab,
  selectedLocation,
  setSelectedLocation = () => {},
  onClickProfile = () => {},
}) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    getData();
  }, [selectedLocation]);

  async function getData() {
    const location = selectedLocation?.value?.split("-");
    let type = location[0];
    let id = location[1];
    if (type === "state") {
      const response = await getRequest({
        API: `${API_END_POINTS.LOCATIONS_CITIES}${id}`,
      });
      if (response.data) {
        let update = response.data?.data.cities.map((item) => ({
          ...item,
          type: "city",
        }));
        const locationOptions = update?.map((item) => {
          let data = { ...item };
          data["locationIcon"] = getFollowerCount(item?.usersCount);
          return data;
        });
        setLocations([...locationOptions]);
      }
    } else if (type === "city") {
      setDisableTab(true);
      setActiveTab("tab2");
    } else {
      let response = await getRequest({ API: API_END_POINTS.LOCATIONS_state });
      if (response?.data?.data.country) {
        let update = response?.data.data.states.map((item) => ({
          ...item,
          type: "state",
          hierarchy: true,
        }));
        const locationOptions = update.map((item) => {
          let data = { ...item };
          data["locationIcon"] = getFollowerCount(item?.usersCount);
          return data;
        });
        setLocations([...locationOptions]);
      }
    }
  }

  const onClickState = (id, type, name) => {
    setSelectedLocation({
      label: name,
      value: `${type}-${id}`,
    });
  };

  return (
    <div className="title_mains">
      {locations?.length > 0 &&
        locations.map((location, index) => (
          <div className="locPro" key={index}>
            <div className="top-bottom ">
              <div className="titles_top">
                <LocationIcon
                  title={location?.locationIcon}
                  style={{ height: 40, width: 30 }}
                />
                <h4
                  onClick={() =>
                    onClickState(
                      location.id || location.city_id,
                      location.type,
                      location.name || location.city_name
                    )
                  }
                  className="cursor-point"
                >
                  {location.name || location.city_name}
                </h4>
              </div>
              <UserDetailCard
                image={
                  location?.empowerOne?.pfp
                    ? IMAGE_URL + location?.empowerOne?.pfp
                    : imgpro
                }
                firstName={location?.empowerOne?.firstName}
                usersCount={location.usersCount}
                power={location?.power}
                followerCount={location?.empowerOne?.followerCount}
                onClickProfile={() => onClickProfile(location?.empowerOne?.id)}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default LocationTab;
