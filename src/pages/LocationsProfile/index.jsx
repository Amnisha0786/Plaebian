import { useEffect, useState } from "react";

// library hooks
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// custom components
import LoaderSpiner from "components/Loader";
import SpecialEmpowerVideo from "components/SpecialEmpowersTab/SpecialEmpowerVideo";
import LocationIcon from "components/LocationIcon";
import LocationHeader from "components/LocationHeader";
import UserListCard from "components/UserListCard";
import LocationTab from "components/LocationTab";

// hooks
import useGetApiOnMount from "hooks/useGetApiOnMount";

// styles
import styles from "./styles.module.scss";

// assets
import { ReactComponent as LocationDark } from "assets/icons/Location_4_Gladiator_A.svg";
import { ReactComponent as LocationLight } from "assets/icons/locations-light.svg";
import { ReactComponent as ProfileLight } from "assets/icons/icon_profile.svg";
import { ReactComponent as Bag } from "assets/icons/earn.svg";
import { ReactComponent as Profile } from "assets/icons/profile-dark.svg";
import { ReactComponent as IconLight } from "assets/icons/likes-dark.svg";
import { ReactComponent as IconDark } from "assets/icons/likes-light.svg";

// redux
import { logout } from "redux/sharedSlices/user";
import { startLoading, stopLoading } from "redux/sharedSlices/loader";

// utils
import {
  formatNumberWithOneDecimal,
  getFollowerCount,
  getTitle,
} from "common/utils";
import { toast } from "react-toastify";

// api
import { getRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

// images
import user_img from "assets/images/blank_user.png";

// config
import { IMAGE_URL } from "../../config";

const LocationsProfile = () => {
  const user = useSelector((state) => state.user?.value);

  const [locations, setLocations] = useState();
  const [selectedLocation, setSelectedLocation] = useState({
    label: "USA",
    value: `country-1`,
  });
  const [users, setUsers] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [userTotal, setUserTotal] = useState(0);
  const [location, setLocation] = useState({});
  const [activeTab, setActiveTab] = useState("tab1");
  const [locationType, setLocationType] = useState("country");
  const [allLikedVideos, setAllLikedVideos] = useState(null);
  const [totalLikesCount, setTotalLikesCount] = useState(null);

  const { data, loading } = useGetApiOnMount(`${API_END_POINTS.LOCATIONS}`);
  const [disableTab, setDisableTab] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    if (data && data?.locations) {
      const locationOptions = data?.locations?.map((location) => ({
        value: `${location.type}-${location?.id}`,
        label: location?.name,
        ...location,
      }));

      setLocations([...locationOptions]);
    }
  }, [data]);
  useEffect(() => {
    let type = null;
    let id = null;
    const getLocationData = async () => {
      if (Object.keys(selectedLocation).length) {
        const location = selectedLocation?.value?.split("-");
        type = location[0];
        setLocationType(location[0]);
        id = location[1];
      }
      dispatch(startLoading());

      try {
        const response = await getRequest({
          API: `${API_END_POINTS.LOCATION_PROFILE}/${id || 1}?type=${
            type || "country"
          }`,
        });

        if (response?.success) {
          setLocation({
            ...response?.data?.location,
            locationIcon: getFollowerCount(response?.data?.totalCount),
          });
          setUserProfile({
            ...response?.data?.location?.empowerOne,
            city: response?.data?.location?.empowerOne?.city?.name,
            state: response?.data?.location?.empowerOne?.state?.name,
          });
          if (response?.data?.users) {
            const tempUsers = response?.data?.users?.map((user) => {
              const title = getTitle(user?.followerCount);
              return { ...user, title };
            });
            setUsers(tempUsers);
            setUserTotal(response?.data?.totalCount);
          }
        } else if (response?.status === 401) {
          navigate("/login");
          dispatch(logout());
        } else {
          toast.error(response?.data?.message, "Something went wrong !");
        }
      } catch (error) {
        console.log(error, "error ....");
        toast.error("Something went wrong !");
      } finally {
        dispatch(stopLoading());
      }
    };

    getLocationData();
  }, [selectedLocation]);

  useEffect(() => {
    let type = null;
    let id = null;
    const getAllLikedVideos = async () => {
      dispatch(startLoading());
      try {
        if (Object.keys(selectedLocation).length) {
          const location = selectedLocation?.value?.split("-");
          type = location[0];
          setLocationType(location[0]);
          id = location[1];
        }

        const response = await getRequest({
          API: `${API_END_POINTS.GET_SPECIAL_LIKED_VIDEOS}/${id || 1}?type=${
            type || "country"
          }`,
        });

        if (response?.success) {
          if (response?.data?.videos) {
            setTotalLikesCount(response?.data?.totalCount);
            setAllLikedVideos(response?.data?.videos);
          }
        } else {
          toast(response?.data || "Something went wrong");
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong !");
      } finally {
        dispatch(stopLoading());
      }
    };
    getAllLikedVideos();
  }, [selectedLocation]);

  const getLocationOnChange = async (newValue) => {
    dispatch(startLoading());
    try {
      const response = await getRequest({
        API: `${API_END_POINTS.LOCATION_PROFILE}/${newValue?.id}?type=${newValue?.type}`,
      });
      setLocationType(newValue?.type);
      if (response?.success) {
        setSelectedLocation({
          label: response?.data?.location?.name,
          value: `${newValue?.type}-${response?.data?.location?.id}`,
        });
        setLocation({
          ...response?.data?.location,
          locationIcon: getFollowerCount(response?.data?.totalCount),
        });
        setUserProfile({
          ...response?.data?.location?.empowerOne,
          city: response?.data?.location?.empowerOne?.city?.city?.name,
          state: response?.data?.location?.empowerOne?.state?.state?.name,
        });
        if (response?.data?.users) {
          const tempUsers = response?.data?.users?.map((user) => {
            const title = getTitle(user?.followerCount);
            return { ...user, title };
          });
          setUsers(tempUsers);
          setUserTotal(response?.data?.totalCount);
        }
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast.error(response?.data?.message, "Something went wrong !");
      }
    } catch (error) {
      console.log(error, "error");
      toast.error("Something went wrong !");
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleLocationChange = (newValue) => {
    setSelectedLocation(newValue);
    getLocationOnChange(newValue);
  };

  const handleTabClick = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
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
  if (loading) {
    return <LoaderSpiner />;
  }

  return (
    <>
      <LocationHeader
        locations={locations}
        handleLocationChange={handleLocationChange}
      />
      <div className={`${styles.title_mains} ${styles.location_profile}`}>
        <div className={styles.top_bottom}>
          <div className={styles.bgColor}>
            <div className={`${styles.titles_top} ${styles.location_space}`}>
              <LocationIcon title={location?.locationIcon} />
              <h4>{selectedLocation?.name || selectedLocation?.label}</h4>
            </div>

            <div className={`${styles.home_profile} ${styles.legionary}`}>
              <div
                className={`${styles.home_img_text}`}
                onClick={() => onClickProfile(userProfile?.id)}
              >
                <div className={styles.home_img}>
                  <img
                    src={
                      userProfile?.pfp
                        ? `${IMAGE_URL}${userProfile?.pfp}`
                        : user_img
                    }
                    alt=""
                    className={styles.power_icon}
                  />
                </div>
                <div
                  className={`${styles.home_head} ${styles.location_profile}`}
                >
                  <div className={styles.d_flex}>
                    <div className={styles.content_botom}>
                      <h2>{`${userProfile?.firstName || ""} ${
                        userProfile?.lastName || ""
                      }`}</h2>
                    </div>
                    <div className={`${styles.content_botom} ${styles.end}`}>
                      <Profile />
                      <span>{userTotal}</span>
                    </div>
                  </div>
                  <div className={styles.d_flex}>
                    <div
                      className={`${styles.content_botom} ${styles.text_grid}`}
                    >
                      {locationType === "country" ? (
                        <>
                          {userProfile?.state && (
                            <>
                              <span>{`${
                                userProfile?.state.charAt(0).toUpperCase() +
                                userProfile?.state.slice(1)
                              } ,`}</span>
                              <span>{`${
                                userProfile?.city.charAt(0).toUpperCase() +
                                userProfile?.city.slice(1)
                              }`}</span>
                            </>
                          )}
                        </>
                      ) : (
                        userProfile?.city && (
                          <span>{`${
                            userProfile?.city.charAt(0).toUpperCase() +
                            userProfile?.city.slice(1)
                          }`}</span>
                        )
                      )}
                    </div>
                    <div className={`${styles.content_botom} ${styles.end}`}>
                      <Bag />
                      <span>
                        {formatNumberWithOneDecimal(location?.power || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.plebeain_page} ${styles.tabsProfiles}`}>
            <div className={styles.icons_section}>
              <div className={styles.icons_img}>
                <button
                  disabled={disableTab}
                  className={activeTab === styles.tab1 ? styles.active : ""}
                >
                  {activeTab === "tab1" ? (
                    <LocationDark onClick={() => handleTabClick("tab1")} />
                  ) : (
                    <LocationLight onClick={() => handleTabClick("tab1")} />
                  )}
                </button>

                <button
                  disabled={disableTab}
                  className={activeTab === styles.tab3 ? styles.active : ""}
                >
                  {activeTab === "tab3" ? (
                    <IconLight onClick={() => handleTabClick("tab3")} />
                  ) : (
                    <IconDark onClick={() => handleTabClick("tab3")} />
                  )}
                </button>

                <button
                  className={activeTab === styles.tab2 ? styles.active : ""}
                >
                  {activeTab === "tab2" ? (
                    <Profile
                      data-tab="tab2"
                      onClick={() => handleTabClick("tab2")}
                    />
                  ) : (
                    <ProfileLight
                      data-tab="tab2"
                      onClick={() => handleTabClick("tab2")}
                    />
                  )}
                </button>
              </div>
            </div>
            <div className={styles.tab_content}>
              {activeTab === "tab1" && (
                <LocationTab
                  setDisableTab={setDisableTab}
                  setActiveTab={setActiveTab}
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                  onClickProfile={onClickProfile}
                />
              )}
              {activeTab === "tab3" && (
                <SpecialEmpowerVideo
                  totalLikesCount={totalLikesCount}
                  allLikedVideos={allLikedVideos}
                />
              )}
              {activeTab === "tab2" && (
                <div>
                  {" "}
                  <div className={styles.listslocations}>
                    {users?.map((user) => (
                      <UserListCard
                        key={user?.id}
                        userDetail={user}
                        id={user?.id}
                        image={user?.pfp}
                        name={user?.firstName}
                        title={user?.title}
                        power={user?.power}
                        followerCount={user?.followerCount}
                        onClickProfile={onClickProfile}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationsProfile;
