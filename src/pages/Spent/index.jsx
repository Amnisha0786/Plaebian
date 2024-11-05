import { useEffect, useState } from "react";

// library Ccmponents
import InfiniteScroll from "react-infinite-scroll-component";

// Custom components
import UserListModal from "components/UserListModal";
import HomeHeader from "components/HomeHeader";

// styles
import styles from "./styles.module.scss";

// Hook
import useGetApiOnMount from "hooks/useGetApiOnMount";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

// API
import { getRequest } from "helper/api";

// constants
import { API_END_POINTS } from "common/apiConstants";

// config
import { IMAGE_URL } from "config";

// redux
import { logout } from "redux/sharedSlices/user";

// library utils
import { toast } from "react-toastify";

const Spent = () => {
  const [userListModal, setUserListModal] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [totalVideo, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: userList } = useGetApiOnMount(API_END_POINTS.GET_TRACK_LIST);

  useEffect(() => {
    getVideo();
  }, []);

  async function getVideo(skip = 0, take = 10) {
    try {
      const response = await getRequest({
        API: `${API_END_POINTS.GET_TRACK_VIDEO}?skip=${skip}&take=${take}`,
      });
      setTotalCount(response.data.count);
      if (response?.success) {
        let data = [...videoList, ...response?.data?.videos];
        setVideoList(data);
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      }
    } catch (error) {
      toast.error("Something went wrong !");
    }
  }
  const getNextData = async () => {
    setPageNumber((prev) => prev + 1);
    getVideo(pageNumber + 1);
  };

  return (
    <div className={styles.spent_parent}>
      <HomeHeader text="Track how other users spend their coins" />
      <div className={styles.spents}>
        <div className={styles.center} onClick={() => setUserListModal(true)}>
          <span>{userList?.count}</span>
          <div>Tracked</div>
        </div>

        <div className={styles.videos} id="scroll-container">
          <InfiniteScroll
            scrollableTarget="scroll-container"
            hasMore={!!videoList?.length < totalVideo}
            next={getNextData}
            dataLength={totalVideo}
          >
            {videoList?.length > 0 &&
              videoList?.map((item, index) => (
                <div
                  className={`${styles.video_box} ${styles.box}`}
                  key={index}
                >
                  <div
                    className={styles.vid}
                    onClick={() => navigate(`/videoDetail/${item?.video_id}`)}
                  >
                    <img
                      src={`${IMAGE_URL}${item?.video_thumbnail}`}
                      alt=""
                      className={styles.logo}
                    />
                  </div>
                  <div className={styles.img_boxs}>
                    <div className={styles.img_box}>
                      <img
                        src={`${IMAGE_URL}${item?.account_pfp}`}
                        alt=""
                        className={styles.icon}
                      />
                      <div className={styles.number}>{item?.totalpower}</div>
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
    </div>
  );
};

export default Spent;
