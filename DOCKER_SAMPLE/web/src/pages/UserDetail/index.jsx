import { useEffect, useState } from "react";

// styles
import "./styles.scss";

// Custom components
import LoaderSpiner from "components/Loader";
import Header from "components/Header";
import EmpowerList from "components/PlebeianComponents/EmpowerList";
import VideoList from "components/PlebeianComponents/VideoList";
import LikesList from "components/PlebeianComponents/LikesList";
import ProfileSection from "components/PlebeianComponents/ProfileSection";

// hooks
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Redux
import { startLoading, stopLoading } from "redux/sharedSlices/loader";

// images
import PowerCoin from "assets/icons/power-coin.png";
import { ReactComponent as VideosLight } from "assets/icons/videos-icon-light.svg";
import { ReactComponent as VideosDark } from "assets/icons/videos-icon-dark.svg";
import { ReactComponent as LikesLight } from "assets/icons/likes-light.svg";
import { ReactComponent as LikesDark } from "assets/icons/likes-dark.svg";
import { ReactComponent as ProfileLight } from "assets/icons/empowerers-light.svg";
import { ReactComponent as ProfileDark } from "assets/icons/empowerers-dark.svg";

// utils
import { toast } from "react-toastify";
import { getTitle } from "common/utils";

// Config
import { API_URL } from "config";

// api
import { deleteRequest, getRequest, postRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

const UserProfile = () => {
  const [showEmpowerersTab, setShowEmpowerersTab] = useState(true);

  const [activeTab, setActiveTab] = useState("video");
  const [userProfile, setUserProfile] = useState({});
  const [userEmpower, setUserEmpower] = useState([]);
  const [userEmpowering, setUserEmpowerings] = useState([]);
  const [allLikedVideos, setAllLikedVideos] = useState([]);
  const [totalLikesCount, setTotalLikesCount] = useState(0);
  const [totalVideosCount, setTotalVideosCount] = useState(0);

  const [userAllVideos, setUserAllVideos] = useState([]);
  const user = useSelector((state) => state.user.value);
  const isLoading = useSelector((state) => state.loader.isLoading);
  const dispatch = useDispatch();
  const { userId } = useParams();
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

  useEffect(() => {
    if (userId) {
      getUserProfile();
      getEmpowerers();
      getEmpowerings();
      getUserAllVideo();
    }
  }, [userId]);

  const getEmpowerers = async () => {
    dispatch(startLoading());
    const response = await getRequest({
      API: `${API_END_POINTS.GET_ACCOUNT_EMPOWERERS}${userId}`,
    });
    if (response?.status === 200) {
      setUserEmpower(response?.data?.followers);
    } else {
      toast(response?.data || "Something went wrong");
    }
    dispatch(stopLoading());
  };

  const getEmpowerings = async () => {
    dispatch(startLoading());
    const response = await getRequest({
      API: `${API_END_POINTS.GET_ACCOUNT_EMPOWERINGS}${userId}`,
    });
    if (response?.status === 200) {
      setUserEmpowerings(response?.data?.followings);
    } else {
      toast(response?.data || "Something went wrong");
    }
    dispatch(stopLoading());
  };

  const getUserProfile = async () => {
    dispatch(startLoading());
    const response = await getRequest({
      API: `${API_END_POINTS.GET_ACCOUNT_PROFILE}${userId}`,
    });
    if (response?.status === 200) {
      const title = getTitle(response?.data?.account?.followerCount);
      setUserProfile({ ...response?.data, title });
    }
    dispatch(stopLoading());
  };

  const getUserAllVideo = async () => {
    dispatch(startLoading());
    const response = await getRequest({
      API: `${API_END_POINTS.GET_USER_ALL_VIDEOS}${userId}?skip=${userAllVideos?.length ? userAllVideos?.length : 0
        }&&take=6`,
    });
    if (response?.status) {
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
      API: `${API_END_POINTS.GET_LIKED_VIDEOS}${user?.account?.id
        }/empower?skip=${allLikedVideos?.length ? allLikedVideos.length : 0
        }&&take=6`,
    });
    if (response?.status) {
      if (response?.data?.videos) {
        setTotalLikesCount(response?.data?.totalCount);
        setAllLikedVideos((prev) => [...prev, ...response?.data?.videos]);
      }
    } else {
      toast(response?.data || "Something went wrong");
    }
    dispatch(stopLoading());
  };

  const follow = () => {
    if (userProfile?.youFollowing) {
      onUnFollow();
    } else {
      onFollow();
    }
  };

  const onFollow = async () => {
    dispatch(startLoading());
    const body = {
      id: userId,
    };
    const response = await postRequest({
      API: `${API_END_POINTS.FOLLOW}`,
      DATA: body,
    });
    if (response?.status === 200) {
      getUserProfile();
      getEmpowerers();
      toast(response.message, {
        type: "success",
      });
    } else {
      toast(response.message, {
        type: "error",
      });
    }
    dispatch(stopLoading());
  };

  const onUnFollow = async () => {
    dispatch(startLoading());
    const resUpload = await deleteRequest({
      API: `${API_END_POINTS.UNFOLLOW}`,
      DATA: {
        id: userId,
      },
    });
    if (resUpload?.data?.success) {
      getUserProfile();
      getEmpowerers();
      toast(resUpload?.data?.message, {
        type: "success",
      });
    } else {
      toast(resUpload.message, {
        type: "error",
      });
    }
    dispatch(stopLoading());
  };

  const handleFullWatch = async (post, fromLikes) => {
    const body = {
      power: 1,
      videoId: post?.videoId,
    };
    const response = await postRequest({
      API: `${API_URL}api/video/addPowerToAccount`,
      DATA: body,
    });
    if (response.status === 200 && !fromLikes) {
      getUserAllVideo();
    } else {
      toast(response.data || "Something went wrong");
    }
  };

  const renderTabContent = () => {
    if (activeTab === "likes") {
      return (
        <LikesList
          likeVideos={allLikedVideos}
          handleFullWatch={handleFullWatch}
          totalLikesCount={totalLikesCount}
          getLikesData={getAllLikedVideos}
        />
      );
    } else if (activeTab === "video") {
      return (
        <VideoList
          videos={userAllVideos}
          handleFullWatch={handleFullWatch}
          totalLikesCount={totalVideosCount}
          getVideosData={getUserAllVideo}
        />
      );
    } else {
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
    }
  };

  return (
    <>
      <Header />
      {isLoading ? (
        <LoaderSpiner />
      ) : (
        <div className="plebeain_page">
          <ProfileSection
            isUser={user?.account?.id !== userProfile?.account?.id}
            profile={userProfile}
            setUserProfile={setUserProfile}
            onFollow={follow}
          />
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
            </div>
          </div>
          {renderTabContent()}
        </div>
      )}
    </>
  );
};

export default UserProfile;
