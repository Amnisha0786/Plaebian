import { useEffect, useState } from "react";

// Custom components
import VideoList from "components/PlebeianComponents/VideoList";
import LikesList from "components/PlebeianComponents/LikesList";
import LoaderSpiner from "components/Loader";
import EmpowerList from "components/PlebeianComponents/EmpowerList";
import HomeHeader from "components/HomeHeader";
import ProfileSection from "components/PlebeianComponents/ProfileSection";
import ProfileComment from "components/ProfileComment";

// styles
import styles from "./styles.module.scss";

// hooks
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import useGetApiOnMount from "hooks/useGetApiOnMount";
import { useNavigate } from "react-router-dom";

// Redux
import { startLoading, stopLoading } from "redux/sharedSlices/loader";

// images
import { ReactComponent as Comments } from "assets/icons/chat.svg";
import { ReactComponent as CommentsLight } from "assets/icons/chatlight.svg";
import PowerCoin from "assets/icons/power-coin.png";
import { ReactComponent as VideosLight } from "assets/icons/videos-icon-light.svg";
import { ReactComponent as VideosDark } from "assets/icons/videos-icon-dark.svg";
import { ReactComponent as LikesLight } from "assets/icons/likes-light.svg";
import { ReactComponent as LikesDark } from "assets/icons/likes-dark.svg";
import { ReactComponent as ProfileLight } from "assets/icons/empowerers-light.svg";
import { ReactComponent as ProfileDark } from "assets/icons/empowerers-dark.svg";

// utils
import { formatNumberWithOneDecimal, getTitle } from "common/utils";

// api
import { getRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

// redux
import { logout, updateDetails } from "redux/sharedSlices/user";

const Plebeian = () => {
  const [showEmpowerersTab, setShowEmpowerersTab] = useState(true);
  const [activeTab, setActiveTab] = useState("video");
  const [userProfile, setUserProfile] = useState({});
  const [userEmpower, setUserEmpower] = useState([]);
  const [userEmpowering, setUserEmpowerings] = useState([]);
  const [userAllVideos, setUserAllVideos] = useState([]);
  const [allLikedVideos, setAllLikedVideos] = useState([]);
  const [totalLikesCount, setTotalLikesCount] = useState(0);
  const [totalVideosCount, setTotalVideosCount] = useState(0);

  const navigate = useNavigate();

  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const { data: profile, loading: profileLoading } = useGetApiOnMount(
    `${API_END_POINTS.GET_ACCOUNT_PROFILE}${user?.account?.id}`
  );
  const { data: empowers, loading: empowersLoading } = useGetApiOnMount(
    `${API_END_POINTS.GET_ACCOUNT_EMPOWERERS}${user?.account?.id}`
  );
  const { data: empowering, loading: empoweringLoading } = useGetApiOnMount(
    `${API_END_POINTS.GET_ACCOUNT_EMPOWERINGS}${user?.account?.id}`
  );

  const showEmpowerers = () => setShowEmpowerersTab(true);
  const showEmpowering = () => setShowEmpowerersTab(false);

  const handleVideoClick = () => {
    getUserAllVideo();
    setActiveTab("video");
  };
  const handleLikesClick = () => {
    setActiveTab("likes");
    getAllLikedVideos();
  };
  const handleProfileClick = () => setActiveTab("profile");
  const handleCommentClick = () => setActiveTab("comment");

  useEffect(() => {
    if (profile && !Object.keys(userProfile)?.length) {
      const title = getTitle(profile?.account?.followerCount);
      dispatch(updateDetails({ power: profile?.account?.power }));
      setUserProfile({ ...profile, title });
    }
    if (empowers && !userEmpower?.length) {
      setUserEmpower(empowers?.followers);
    }
    if (empowering && !userEmpowering?.length) {
      setUserEmpowerings(empowering?.followings);
    }
  }, [profile, empowers, empowering]);

  useEffect(() => {
    if (user?.token) {
      getUserAllVideo();
    }
  }, []);

  const getUserAllVideo = async () => {
    try {
      dispatch(startLoading());
      const response = await getRequest({
        API: `${API_END_POINTS.GET_USER_ALL_VIDEOS}${user?.account?.id}?skip=${
          userAllVideos.length ? userAllVideos.length : 0
        }&&take=6`,
      });
      if (response?.success) {
        if (response?.data?.videos) {
          setTotalVideosCount(response?.data?.totalCount);
          setUserAllVideos((prev) => [...prev, ...response?.data?.videos]);
        }
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong !");
    } finally {
      dispatch(stopLoading());
    }
  };

  const getAllLikedVideos = async () => {
    dispatch(startLoading());
    try {
      const response = await getRequest({
        API: `${API_END_POINTS.GET_LIKED_VIDEOS}${user?.account?.id}?skip=${
          allLikedVideos.length ? allLikedVideos.length : 0
        }&&take=6`,
      });
      if (response?.success) {
        if (response?.data?.videos) {
          setTotalLikesCount(response?.data?.totalCount);
          setAllLikedVideos((prev) => [...prev, ...response?.data?.videos]);
        }
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong !");
    } finally {
      dispatch(stopLoading());
    }
  };

  const removeVideo = (videoId) => {
    const currentVideos = [...userAllVideos];
    const newVideos = currentVideos.filter((video) => video.id !== videoId);
    setUserAllVideos(newVideos);
  };

  const renderTabContent = () => {
    if (activeTab === "likes") {
      return (
        <LikesList
          likeVideos={allLikedVideos}
          totalLikesCount={totalLikesCount}
          getLikesData={getAllLikedVideos}
        />
      );
    } else if (activeTab === "video") {
      return (
        <VideoList
          videos={userAllVideos}
          totalLikesCount={totalVideosCount}
          getVideosData={getUserAllVideo}
          removeVideo={removeVideo}
          usersVideo={true}
        />
      );
    } else if (activeTab === "profile") {
      return (
        <>
          <div className={styles.empowers}>
            <div className={styles.empowers_text}>
              <h4
                onClick={showEmpowerers}
                style={{ fontWeight: showEmpowerersTab ? "900" : "700" }}
              >
                {userEmpower?.length} EMPOWERERS
              </h4>
              <h4
                onClick={showEmpowering}
                style={{ fontWeight: showEmpowerersTab ? "700" : "900" }}
              >
                {userEmpowering?.length} EMPOWERING
              </h4>
            </div>
          </div>
          {/* <div className="searchs">
            <input type="text" placeholder="Name Search" />
          </div> */}
          <p className={styles.power_p}>
            {showEmpowerersTab ? (
              <>
                Your EMPOWERERS Provide You{" "}
                {parseFloat(userEmpower?.length * 0.1).toFixed(1)}
                <img src={PowerCoin} alt="" className={styles.power_icon} />
                Today
              </>
            ) : (
              <>
                You are providing your empowerers with a sum of{" "}
                {formatNumberWithOneDecimal(userEmpowering?.length * 0.1)}
                <img
                  src={PowerCoin}
                  alt=""
                  className={styles.power_icon}
                />{" "}
                daily
              </>
            )}
          </p>

          {showEmpowerersTab ? (
            <EmpowerList empowerers={userEmpower} />
          ) : (
            <EmpowerList empowerers={userEmpowering} />
          )}
        </>
      );
    } else {
      return <ProfileComment />;
    }
  };

  const handleSettingsClick = () => navigate("/settings");

  return (
    <>
      <HomeHeader
        text={"Settings/Logout"}
        className={styles.textSize}
        onClickText={handleSettingsClick}
      />
      {profileLoading || empowersLoading || empoweringLoading ? (
        <LoaderSpiner />
      ) : (
        <div className={styles.plebeain_page}>
          <ProfileSection profile={userProfile} />
          <div className={styles.icons_section}>
            <div className={styles.icons_img}>
              <div onClick={handleVideoClick}>
                {activeTab === "video" ? <VideosDark /> : <VideosLight />}
              </div>
              <div onClick={handleLikesClick}>
                {activeTab === "likes" ? <LikesDark /> : <LikesLight />}
              </div>
              <div className={styles.user_tab} onClick={handleProfileClick}>
                {activeTab === "profile" ? <ProfileDark /> : <ProfileLight />}
              </div>
              <div className={styles.user_tab} onClick={handleCommentClick}>
                {activeTab === "comment" ? <Comments /> : <CommentsLight />}
              </div>
            </div>
          </div>
          {renderTabContent()}
        </div>
      )}
    </>
  );
};

export default Plebeian;
