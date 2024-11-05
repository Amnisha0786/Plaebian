import { useEffect, useState } from "react";

// library Ccmponents
import InfiniteScroll from "react-infinite-scroll-component";

// Custom components
import UserListModal from "components/UserListModal";
import HomeHeader from "components/HomeHeader";

// styles
import "./styles.scss";

// Hook
import useGetApiOnMount from "hooks/useGetApiOnMount";
import { useNavigate } from "react-router-dom";

// API
import { getRequest } from "helper/api";

// constants
import { API_END_POINTS } from "common/apiConstants";

// config
import { IMAGE_URL } from "config";

const Spent = () => {
  const [userListModal, setUserListModal] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [totalVideo, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const { data: userList } = useGetApiOnMount(API_END_POINTS.GET_TRACK_LIST);

  useEffect(() => {
    getVideo();
  }, []);
  async function getVideo(skip = 0, take = 10) {
    const response = await getRequest({
      API: `${API_END_POINTS.GET_TRACK_VIDEO}?skip=${skip}&take=${take}`,
    });
    setTotalCount(response?.data.data.count);
    if (response?.status === 200) {
      let data = [...videoList, ...response?.data?.data?.videos];
      setVideoList(data);
    }
  }
  const getNextData = async () => {
    setPageNumber((prev) => prev + 1);
    getVideo(pageNumber + 1);
  };

  return (
    <>
      <HomeHeader text="Track how other users spent their coins" />
      <div className="spents">
        <div className="center" onClick={() => setUserListModal(true)}>
          <span>{userList?.count}</span>
          <div>Tracked</div>
        </div>

        <div className="videos" id="scroll-container">
          <InfiniteScroll
            scrollableTarget="scroll-container"
            hasMore={!!videoList?.length < totalVideo}
            next={getNextData}
            dataLength={totalVideo}
          >
            {videoList?.length > 0 &&
              videoList?.map((item, index) => (
                <div className="video_box" key={index}>
                  <div className="vid" onClick={() => navigate(`/videoDetail/${item?.video_id}`)}>
                    <img
                      src={`${IMAGE_URL}${item?.video_thumbnail}`}
                      alt=""
                      className="logo"
                    />
                  </div>
                  <div className="img-boxs">
                    <div className="img-box">
                      <img
                        src={`${IMAGE_URL}${item?.account_pfp}`}
                        alt=""
                        className="icon"
                      />
                      <div className="number">
                        {item?.totalpower}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </InfiniteScroll>
        </div>
        {userListModal && (
          <UserListModal
            open={userListModal}
            userList={userList || []}
            onHide={() => setUserListModal(false)}
          />
        )}
      </div>
    </>
  );
};

export default Spent;
