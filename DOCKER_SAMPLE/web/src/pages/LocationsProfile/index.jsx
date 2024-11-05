import { useEffect, useState } from "react";

// library hooks
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// custom components
import LocationIcon from "components/LocationIcon";
import LocationHeader from "components/LocationHeader";
import UserListCard from "components/UserListCard";
import LocationTab from "components/LocationTab";

// hooks
import useGetApiOnMount from "hooks/useGetApiOnMount";

// styles
import "./styles.scss";

// assets
import { ReactComponent as LocationDark } from "assets/icons/Location_4_Gladiator_A.svg";
import { ReactComponent as ProfileLight } from "assets/icons/icon_profile.svg";
import { ReactComponent as Bag } from "assets/icons/earn.svg";
import { ReactComponent as Profile } from "assets/icons/profile-dark.svg";

// redux
import * as loader from "redux/sharedSlices/loader";

// utils
import { getFollowerCount, getTitle } from "common/utils";

// api
import { getRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

// config
import { IMAGE_URL } from "../../config";
import { toast } from "react-toastify";
import LoaderSpiner from "components/Loader";

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

  const { data, loading } = useGetApiOnMount(`${API_END_POINTS.LOCATIONS}`);
  const [disableTab, setDisableTab] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    if (data?.data && data?.data?.locations) {
      const locationOptions = data?.data?.locations?.map((location) => ({
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
      dispatch(loader.startLoading());
      if (Object.keys(selectedLocation).length) {
        const location = selectedLocation?.value?.split("-");
        type = location[0];
        id = location[1];
      }
      const response = await getRequest({
        API: `${API_END_POINTS.LOCATION_PROFILE}/${id || 1}?type=${type || "country"
          }`,
      });

      if (response?.status === 200) {
        setLocation({
          ...response?.data?.data?.location,
          locationIcon: getFollowerCount(response?.data?.data?.totalCount),
        });
        setUserProfile({
          ...response?.data?.data?.location?.empowerOne,
          title: getTitle(
            response?.data?.data?.location?.empowerOne?.followerCount
          ),
        });
        if (response?.data?.data?.users) {
          const tempUsers = response?.data?.data?.users?.map((user) => {
            const title = getTitle(user?.followerCount);
            return { ...user, title };
          });
          setUsers(tempUsers);
          setUserTotal(response?.data?.data?.totalCount);
        }
      }
      dispatch(loader.stopLoading());
    };

    getLocationData();
  }, [selectedLocation]);
  const getLocationOnChange = async (newValue) => {
    dispatch(loader.startLoading());
    const response = await getRequest({
      API: `${API_END_POINTS.LOCATION_PROFILE}/${newValue?.id}?type=${newValue?.type}`,
    });
    if (response?.status === 200) {
      setSelectedLocation({
        label: response?.data?.data?.location?.name,
        value: `${newValue?.type}-${response?.data?.data?.location?.id}`,
      });
      setLocation({
        ...response?.data?.location,
        locationIcon: getFollowerCount(response?.data?.data?.totalCount),
      });
      setUserProfile({
        ...response?.data?.location?.empowerOne,
        title: getTitle(
          response?.data?.data?.location?.empowerOne?.followerCount
        ),
      });
      if (response?.data?.data?.users) {
        const tempUsers = response?.data?.data?.users?.map((user) => {
          const title = getTitle(user?.followerCount);
          return { ...user, title };
        });
        setUsers(tempUsers);
        setUserTotal(response?.data?.totalCount);
      }
    }
    dispatch(loader.stopLoading());
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
      <div className="title_mains">
        <div className="top-bottom">
          <div className="bgColor">
            <div className="titles_top location-space">
              <LocationIcon title={location?.locationIcon} />
              <h4>{selectedLocation?.name || selectedLocation?.label}</h4>
            </div>

            <div className="home_profile legionary">
              <div
                className="home-img-text cursor-point"
                onClick={() => onClickProfile(userProfile?.id)}
              >
                <div className="home-img">
                  <img
                    src={`${IMAGE_URL}${userProfile?.pfp}`}
                    alt=""
                    className="power-icon"
                  />
                </div>
                <div className="home-head location-profile">
                  <div className="d-flex">
                    <div className="content_botom">
                      <h2>{`${userProfile?.firstName} ${userProfile?.lastName}`}</h2>
                    </div>
                    <div className="content_botom end">
                      <Profile />
                      <span>{userTotal}</span>
                    </div>
                  </div>
                  <div className="d-flex">
                    <div className="content_botom">
                      <h2>{userProfile?.title}</h2>
                    </div>
                    <div className="content_botom end">
                      <Bag />
                      <span>{parseInt(location?.power || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="plebeain_page tabsProfiles">
            <div className="icons_section">
              <div className=" icons_img">
                <button
                  disabled={disableTab}
                  className={activeTab === "tab1" ? "active" : ""}
                >
                  {activeTab === "tab1" ? (
                    <LocationDark onClick={() => handleTabClick("tab1")} />
                  ) : (
                    <LocationDark onClick={() => handleTabClick("tab1")} />
                  )}
                </button>
                <button className={activeTab === "tab2" ? "active" : ""}>
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
            <div className="tab-content">
              {activeTab === "tab1" && (
                <LocationTab
                  setDisableTab={setDisableTab}
                  setActiveTab={setActiveTab}
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                  onClickProfile={onClickProfile}
                />
              )}
              {activeTab === "tab2" && (
                <div>
                  {" "}
                  <div className="listslocations">
                    {users?.map((user) => (
                      <UserListCard
                        key={user?.id}
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
