import { useEffect, useState } from "react";

// hooks
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

// custom components
import LocationHeader from "components/LocationHeader";
import LoaderSpiner from "components/Loader";
import ProgressBar from "components/ProgressBar";

// api
import useGetApiOnMount from "hooks/useGetApiOnMount";
import { API_END_POINTS } from "common/apiConstants";
import { getRequest } from "helper/api";

// config
import { IMAGE_URL } from "../../config";

// styles
import styles from "./styles.module.scss";

// redux
import { logout } from "redux/sharedSlices/user";

// library utils
import { toast } from "react-toastify";

const Ranks = () => {
  const [ranksList, setRankList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState({
    value: "country-1",
    label: "USA",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, loading } = useGetApiOnMount(
    `${API_END_POINTS.GET_RANKS}/1/country`
  );
  const { data: locationData } = useGetApiOnMount(
    `${API_END_POINTS.LOCATIONS}`
  );

  useEffect(() => {
    if (data?.videos?.length) {
      setRankList(data?.videos);
    }
    if (locationData && locationData?.locations) {
      const locationOptions = locationData?.locations?.map((location) => ({
        value: `${location.type}-${location?.id}`,
        label: location?.name,
      }));
      setLocationOptions([...locationOptions]);
    }
    setLoader(loading);
  }, [data, locationData, loading]);

  const getRankList = async (location) => {
    setLoader(true);
    try {
      const [type, id] = location?.value?.split("-");
      const response = await getRequest({
        API: `${API_END_POINTS.GET_RANKS}/${id}/${type}`,
      });
      if (response?.success) {
        if (response?.data?.videos) {
          setRankList(response?.data?.videos);
        }
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      }
    } catch (error) {
      toast.error("Something went wrong !");
    } finally {
      setLoader(false);
    }
  };

  const handleLocationChange = (newValue) => {
    setSelectedOption(newValue);
    getRankList(newValue);
  };

  return (
    <div className="rank-parent">
      <LocationHeader
        locations={locationOptions}
        handleLocationChange={handleLocationChange}
        value={selectedOption}
      />

      {loader ? (
        <LoaderSpiner />
      ) : (
        <div className={`${styles.spentsone} ${styles.spents} `}>
          <div className={styles.videos}>
            {ranksList?.length
              ? ranksList?.map((video, index) => (
                  <div
                    key={index}
                    className={styles.video_box}
                    onClick={() => navigate("/videoDetail/" + video.id)}
                  >
                    <div className={styles.vid}>
                      {" "}
                      <img src={`${IMAGE_URL}${video?.thumbnail}`} alt="" />
                    </div>
                    <ProgressBar
                      bgcolor="#8d784d"
                      coinsUsed={video?.powerTransferred}
                      coinsAssigned={video?.power}
                      height={28}
                      lineHeight="0px"
                      // className="progress-bar"
                      className={styles.progress_bar}
                      iconClassName={styles.icon_bar}
                      svgClassName={styles.svg}
                    />
                  </div>
                ))
              : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ranks;
