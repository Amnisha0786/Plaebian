import { useEffect, useState } from "react";

// hooks
import { useNavigate } from "react-router-dom";

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
import "./styles.scss";

const Ranks = () => {
  const [ranksList, setRankList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState({
    value: "country-1",
    label: "USA",
  });

  const navigate = useNavigate();

  const { data, loading } = useGetApiOnMount(
    `${API_END_POINTS.GET_RANKS}/1/country`
  );
  const { data: locationData } = useGetApiOnMount(
    `${API_END_POINTS.LOCATIONS}`
  );

  useEffect(() => {
    if (data?.data?.videos?.length) {
      setRankList(data?.data?.videos);
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
    const [type, id] = location?.value?.split("-");
    const response = await getRequest({
      API: `${API_END_POINTS.GET_RANKS}/${id}/${type}`,
    });
    if (response?.status === 200) {
      if (response?.data?.data?.videos) {
        setRankList(response?.data?.data?.videos);
      }
    }
    setLoader(false);
  };

  const handleLocationChange = (newValue) => {
    setSelectedOption(newValue);
    getRankList(newValue);
  };

  return (
    <>
      <LocationHeader
        locations={locationOptions}
        handleLocationChange={handleLocationChange}
        value={selectedOption}
      />

      {loader ? (
        <LoaderSpiner />
      ) : (
        <div className="spentsone spents">
          <div className="videos">
            {ranksList?.length
              ? ranksList?.map((video, index) => (
                  <div
                    key={index}
                    className="video_box"
                    onClick={() => navigate("/videoDetail/" + video.id)}
                  >
                    <div className="vid">
                      {" "}
                      <img src={`${IMAGE_URL}${video?.thumbnail}`} alt="" />
                    </div>
                    <ProgressBar
                      bgcolor="orange"
                      coinsUsed={video?.powerTransferred}
                      coinsAssigned={video?.power}
                      height={20}
                      lineHeight="0px"
                      className="progress-bar"
                      iconClassName="icon-bar"
                    />
                  </div>
                ))
              : null}
          </div>
        </div>
      )}
    </>
  );
};

export default Ranks;
