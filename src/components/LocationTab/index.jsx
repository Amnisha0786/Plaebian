import { useEffect, useState } from "react";

// hooks
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

// custom components
import LocationIcon from "components/LocationIcon";
import UserDetailCard from "../userDetailCard";

// redux
import { logout } from "redux/sharedSlices/user";

// api
import { API_END_POINTS } from "common/apiConstants";
import { getRequest } from "helper/api";

// images
import user_img from "assets/images/blank_user.png";

// config
import { IMAGE_URL } from "config";

// utils
import { getFollowerCount } from "common/utils";

//styles
import styles from "pages/Locations/styles.module.scss";

// library utils
import { toast } from "react-toastify";

const LocationTab = ({
  setDisableTab,
  setActiveTab,
  selectedLocation,
  setSelectedLocation = () => {},
  onClickProfile = () => {},
}) => {
  const [locations, setLocations] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, [selectedLocation]);

  async function getData() {
    const location = selectedLocation?.value?.split("-");
    let type = location[0];
    let id = location[1];
    try {
      if (type === "state") {
        const response = await getRequest({
          API: `${API_END_POINTS.LOCATIONS_CITIES}${id}`,
        });
        if (response?.data) {
          let update = response?.data?.cities?.map((item) => ({
            ...item,
            type: "city",
          }));
          const locationOptions = update?.map((item) => {
            let data = { ...item };
            data["locationIcon"] = getFollowerCount(item?.usersCount);
            return data;
          });
          setLocations(locationOptions);
        } else if (response?.data.status === 401) {
          navigate("/login");
          dispatch(logout());
        } else {
          toast.error(response?.data?.message, "Something went wrong !");
        }
      } else if (type === "city") {
        setDisableTab(true);
        setActiveTab("tab2");
      } else {
        let response = await getRequest({
          API: API_END_POINTS.LOCATIONS_state,
        });
        if (response?.data?.country) {
          let update = response.data.states.map((item) => ({
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
        } else if (response?.data.status === 401) {
          navigate("/login");
          dispatch(logout());
        } else {
          toast.error(response?.data?.message, "Something went wrong !");
        }
      }
    } catch (error) {
      toast.error("Something went wrong !");
    }
  }

  const onClickState = (id, type, name) => {
    setSelectedLocation({
      label: name,
      value: `${type}-${id}`,
    });
  };

  return (
    <div className={styles.title_mains}>
      {locations?.length > 0 &&
        locations.map((location, index) => (
          <div className={styles.locPro} key={index}>
            <div className={styles.top_bottom}>
              <div className={styles.titles_top}>
                <LocationIcon
                  title={location?.locationIcon}
                  style={{ height: 40, width: 30 }}
                />
                <h4
                  onClick={() =>
                    onClickState(
                      location?.id || location?.city_id,
                      location?.type,
                      location?.name || location?.city_name
                    )
                  }
                  className={styles.cursor_point}
                >
                  {location.name || location.city_name}
                </h4>
              </div>
              <UserDetailCard
                image={
                  location?.empowerOne?.pfp
                    ? IMAGE_URL + location?.empowerOne?.pfp
                    : user_img
                }
                firstName={location?.empowerOne?.firstName || ""}
                userDetail={location?.empowerOne}
                usersCount={location.usersCount}
                power={location?.power || location?.city_power}
                followerCount={location?.empowerOne?.followerCount}
                onClickProfile={() =>
                  location?.empowerOne?.id &&
                  onClickProfile(location?.empowerOne?.id)
                }
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export default LocationTab;
