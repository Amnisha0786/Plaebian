import { useEffect, useState } from "react";

// custom components
import LocationHeader from "components/LocationHeader";

// hooks
import { useNavigate } from "react-router-dom";
import useGetApiOnMount from "hooks/useGetApiOnMount";

// styles
import styles from "./styles.module.scss";

// images
import imgpro from "assets/images/imgpro.png";

// assets
import { ReactComponent as Bag } from "assets/icons/earn.svg";
import { ReactComponent as ProfileDark } from "assets/icons/empowerers-dark.svg";

// api
import { API_END_POINTS } from "common/apiConstants";
import { getRequest } from "helper/api";

// config
import { IMAGE_URL } from "config";

// library utils
import { toast } from "react-toastify";

// redux
import { useDispatch, useSelector } from "react-redux";
import { startLoading, stopLoading } from "redux/sharedSlices/loader";
import { logout } from "redux/sharedSlices/user";

// utils
import { formatNumberWithOneDecimal } from "common/utils";

const Titles = () => {
  const user = useSelector((state) => state.user?.value);

  const { data } = useGetApiOnMount(
    `${API_END_POINTS.GET_TITLES_USERS_LIST}/1?type=country`
  );
  const { data: locationData } = useGetApiOnMount(
    `${API_END_POINTS.LOCATIONS}`
  );
  const [locationOptions, setLocationOptions] = useState([]);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    setUsersList(data);
  }, [data]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (locationData && locationData?.locations) {
      const locations = locationData?.locations?.map((location) => ({
        value: `${location.type}-${location?.id}`,
        id: `${location?.id}`,
        label: location?.name,
        type: location?.type,
      }));
      setLocationOptions([...locations]);
    }
  }, [locationData]);

  const getLocationOnChange = async (newValue) => {
    dispatch(startLoading());
    try {
      const response = await getRequest({
        API: `${API_END_POINTS.GET_TITLES_USERS_LIST}/${newValue?.id}?type=${newValue?.type}`,
      });
      if (response?.success) {
        setUsersList(response?.data);
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());

        toast.error(response?.data?.message, "Something went wrong !");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong !");
    } finally {
      dispatch(stopLoading());
    }
  };
  const handleLocationChange = (newValue) => {
    getLocationOnChange(newValue);
  };

  const userNotLogin = () => {
    navigate("/login");
    return toast("You have to login to see other's profile");
  };

  const onClickProfile = (id) => {
    if (!user?.token) {
      userNotLogin();
      return;
    }
    navigate(`/userProfile/${id}`);
  };

  return (
    <>
      <LocationHeader
        locations={locationOptions}
        handleLocationChange={handleLocationChange}
      />

      <div
        className={`${styles.title_mains} ${styles.locations_pages} ${styles.titlepage}`}
      >
        {usersList?.users &&
          usersList?.users?.length > 0 &&
          usersList?.users.map((dataItem, index) => {
            return (
              <div
                className={`${styles.top_bottom} ${styles.extra}`}
                key={index}
                onClick={() => onClickProfile(dataItem?.id)}
              >
                <div className={styles.home_profile}>
                  <div
                    className={`${styles.home_img_text} ${styles.cursor_point}`}
                  >
                    <div className={styles.home_img}>
                      <img
                        src={dataItem?.pfp ? IMAGE_URL + dataItem?.pfp : imgpro}
                        alt=""
                        className={styles.power_icon}
                      />
                    </div>

                    <div className={styles.imgBags}>
                      <div className={`${styles.home_head} ${styles.titles}`}>
                        <h2>{`${dataItem?.firstName || ""} ${
                          dataItem?.lastName || ""
                        }`}</h2>
                        <div className={styles.content_botom}>
                          {dataItem?.empowerLocationCountryName ||
                          dataItem?.empowerLocationStateName ||
                          dataItem?.empowerLocationCityName ? (
                            <span className={styles.text}>
                              EmpowerOne of{" "}
                              {dataItem?.empowerLocationCountryName ||
                                dataItem?.empowerLocationStateName ||
                                dataItem?.empowerLocationCityName}
                            </span>
                          ) : (
                            <span>
                              {`${dataItem?.city.name} , ${dataItem?.state.name}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`${styles.covers} ${styles.endscover}`}>
                        <div className={styles.content_botom}>
                          <ProfileDark />
                          <span>{dataItem?.followerCount} </span>
                        </div>
                        <div className={styles.content_botom}>
                          <Bag />
                          <span>
                            {formatNumberWithOneDecimal(dataItem?.power)}{" "}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default Titles;
