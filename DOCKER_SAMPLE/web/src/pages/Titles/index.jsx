import { useEffect, useState } from "react";

// custom components
import LocationHeader from "components/LocationHeader";

// hooks
import { useNavigate } from "react-router-dom";
import useGetApiOnMount from "hooks/useGetApiOnMount";

// styles
import "./styles.scss";

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
import * as loader from "redux/sharedSlices/loader";

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
    if (locationData?.data && locationData?.data?.locations) {
      const locations = locationData?.data?.locations?.map((location) => ({
        value: `${location.type}-${location?.id}`,
        id: `${location?.id}`,
        label: location?.name,
        type: location?.type,
      }));
      setLocationOptions([...locations]);
    }
  }, [locationData]);

  const getLocationOnChange = async (newValue) => {
    dispatch(loader.startLoading());
    const response = await getRequest({
      API: `${API_END_POINTS.GET_TITLES_USERS_LIST}/${newValue?.id}?type=${newValue?.type}`,
    });
    if (response?.status === 200) {
      setUsersList(response?.data);
    }
    dispatch(loader.stopLoading());
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
      <div className="title_mains locations_pages titlepage">
        {usersList?.data?.users &&
          usersList?.data?.users?.length > 0 &&
          usersList.data?.users.map((dataItem, index) => {
            return (
              <div
                className="top-bottom"
                key={index}
                onClick={() => onClickProfile(dataItem?.id)}
              >
                <div className="home_profile">
                  <div className="home-img-text cursor-point">
                    <div className="home-img">
                      <img
                        src={dataItem?.pfp ? IMAGE_URL + dataItem?.pfp : imgpro}
                        alt=""
                        className="power-icon"
                      />
                    </div>

                    <div className="imgBags">
                      <div className="home-head titles">
                        <h2>{`${dataItem?.firstName || ""} ${dataItem?.lastName || ""
                          }`}</h2>
                        <div className="content_botom">
                          {dataItem?.empowerLocationCountryName ||
                          dataItem?.empowerLocationStateName ||
                          dataItem?.empowerLocationCityName ? (
                            <span className="text">
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

                      <div className="covers endscover">
                        <div className="content_botom">
                          <ProfileDark />
                          <span>{dataItem?.followerCount} </span>
                        </div>
                        <div className="content_botom">
                          <Bag />
                          <span>{parseInt(dataItem?.power)} </span>
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
