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
import "./styles.scss";

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
import { getTitle } from "common/utils";

// api
import { getRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

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
      setUserProfile({ ...profile, title });
    }
    if (empowers && !userEmpower?.length) {
      setUserEmpower(empowers?.followers);
    }
    if (empowering && !userEmpowering?.length) {
      setUserEmpowerings(empowering?.data?.followings);
    }
  }, [profile, empowers, empowering]);

  useEffect(() => {
    if (user?.token) {
      getUserAllVideo();
    }
  }, [user]);

  const getUserAllVideo = async () => {
    dispatch(startLoading());
    const response = await getRequest({
      API: `${API_END_POINTS.GET_USER_ALL_VIDEOS}${user?.account?.id}?skip=${
        userAllVideos.length ? userAllVideos.length : 0
      }&&take=6`,
    });
    if (response?.status === 200) {
      if (response?.data?.data?.videos) {
        setTotalVideosCount(response?.data?.data?.totalCount);
        setUserAllVideos((prev) => [...prev, ...response?.data?.data?.videos]);
      }
    } else {
      toast(response?.data || "Something went wrong");
    }
    dispatch(stopLoading());
  };

  const getAllLikedVideos = async () => {
    dispatch(startLoading());
    const response = await getRequest({
      API: `${API_END_POINTS.GET_LIKED_VIDEOS}${user?.account?.id}?skip=${
        allLikedVideos.length ? allLikedVideos.length : 0
      }&&take=6`,
    });
    if (response?.status) {
      if (response?.data?.data?.videos) {
        setTotalLikesCount(response?.data?.data?.totalCount);
        setAllLikedVideos((prev) => [...prev, ...response?.data?.data?.videos]);
      }
    } else {
      toast(response?.data || "Something went wrong");
    }
    dispatch(stopLoading());
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
        />
      );
    } else if (activeTab === "profile") {
      return (
        <>
          <div className="empowers">
            <div className="empowers_text">
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
          <p className="power_p">
            {showEmpowerersTab ? (
              <>
                Your EMPOWERERS Provide You{" "}
                {parseFloat(userEmpower?.length * 0.1).toFixed(1)}
                <img src={PowerCoin} alt="" className="power-icon" />
                Today
              </>
            ) : (
              <>
                You are providing your empowerers with a sum of{" "}
                {userEmpowering?.length * 0.1}
                <img src={PowerCoin} alt="" className="power-icon" /> daily
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
        className={"textSize"}
        onClickText={handleSettingsClick}
      />
      {profileLoading || empowersLoading || empoweringLoading ? (
        <LoaderSpiner />
      ) : (
        <div className="plebeain_page">
          <ProfileSection profile={userProfile} />
          {/* <StatusSection statusArray={statusArray} /> */}
          <div className="icons_section">
            <div className="icons_img">
              <div onClick={handleVideoClick}>
                {activeTab === "video" ? <VideosDark /> : <VideosLight />}
              </div>
              <div onClick={handleLikesClick}>
                {activeTab === "likes" ? <LikesDark /> : <LikesLight />}
              </div>
              <div className="user_tab" onClick={handleProfileClick}>
                {activeTab === "profile" ? <ProfileDark /> : <ProfileLight />}
              </div>
              <div className="user_tab" onClick={handleCommentClick}>
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
