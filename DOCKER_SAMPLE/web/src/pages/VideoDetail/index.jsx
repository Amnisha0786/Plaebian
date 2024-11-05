import { useState, useRef, useEffect } from "react";

// custom components
import Header from "components/Header";
import ProgressBar from "components/ProgressBar";
import TitleIcon from "components/TitleIcon";
import CommentComponent from "components/CommentComponent";
import Video from "components/Video";

// hooks
import { useDispatch, useSelector } from "react-redux";
import { useGetComment } from "hooks/useGetComment";
import { useNavigate, useParams } from "react-router-dom";
import useGetApiOnMount from "hooks/useGetApiOnMount";

// api
import { API_END_POINTS } from "common/apiConstants";

// config
import { IMAGE_URL } from "config";

// images
import { ReactComponent as PowersCoinLight } from "assets/icons/power-coin-light.svg";
import { ReactComponent as PowersCoinDark } from "assets/icons/power-coin-dark.svg";

// styles
import "./styles.scss";

// api
import { deleteRequest, postRequest } from "helper/api";
import { toast } from "react-toastify";

// redux
import { updateDetails } from "redux/sharedSlices/user";

// utils
import { getTitle } from "common/utils";
import DeleteVideoModal from "./DeleteVideoModal/DeleteVideoModal";

const VideoDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user?.value);
  const [errorAddComment, setErrorAddComment] = useState("");
  const {
    commentList,
    getComment,
    setVideoDetail,
    setCommentList,
    videoDetail,
  } = useGetComment();
  const { data: videoDetails } = useGetApiOnMount(
    `${API_END_POINTS?.GET_VIDEO_DETAIL}${params?.videoId}`
  );
  const { data: comment } = useGetApiOnMount(
    `${API_END_POINTS?.GET_COMMENTS}${params?.videoId}`
  );
  const [title, setTitle] = useState("");
  const userDetail = useSelector((state) => state?.user?.value?.account);
  const [commentValue, setCommentValue] = useState("");
  const [openDeleteVideoModal, setOpenDeleteVideoModal] = useState(false);

  const timerRef = useRef();
  const isLongPress = useRef();
  const isLongPressEmpower = useRef();
  const timerRefModal = useRef();

  useEffect(() => {
    if (comment?.data?.comments) {
      setCommentList(comment?.data?.comments);
    }
  }, [comment]);
  useEffect(() => {
    if (videoDetails?.data?.video) {
      setVideoDetail(videoDetails?.data?.video);

      const videoTitle = getTitle(
        videoDetails?.data?.video?.account?.followerCount
      );
      setTitle(videoTitle);
    }
  }, [videoDetails]);

  const handleFullWatch = async (account) => {
    if (account.id !== userDetail.id) {
      const body = {
        power: 1,
        videoId: params?.videoId,
      };
      const previousCoinCount = user?.account?.power;
      const response = await postRequest({
        API: `${API_END_POINTS.ADD_POWER_TO_ACCOUNT_VIDEO}`,
        DATA: body,
      });
      if (response.status === 200) {
        let video = { ...videoDetail };
        if (response.data.account.power !== previousCoinCount) {
          video.powerTransferred += 1;

          setVideoDetail(video);
        }
        dispatch(updateDetails({ power: response.data.account.power }));
      } else {
        toast(response.data || "Something went wrong");
      }
    }
  };

  const onClickEmpowerModal = async (post, coin, succesCallback) => {
    if (parseInt(user?.account?.power) > 0) {
      if (!user?.token) {
        navigate("/login");
        return toast("You have to login to empower");
      }

      let body = {};
      let url = "";

      body["power"] = coin;
      body["comment"] = post.id;
      url = API_END_POINTS.EMPOWER_COMMENT;
      const response = await postRequest({ API: url, DATA: body });
      if (response.status === 200) {
        getComment(videoDetail?.id);
        dispatch(updateDetails({ power: user?.account?.power - coin }));
        if (succesCallback) succesCallback();
      } else {
        toast(response?.data || "Some thing went wrong");
      }
    }
  };

  const onRemoveEmpower = async (post) => {
    if (!user?.token) {
      navigate("/login");
      return toast("You have to login to empower");
    }
    const promises = post?.empower?.map((emp) =>
      deleteRequest({
        API: `${API_END_POINTS.UNEMPOWER_COMMENT}${emp?.id}/${post?.id}`,
      })
    );
    if (promises.length) {
      await Promise.all(promises)
        .then(() => {
          const total = post?.empower?.reduce((total, nextItem) => {
            total += nextItem?.power || 0;
            return total;
          }, 0);
          dispatch(
            updateDetails({ power: user?.account?.power + (total || 0) })
          );
          getComment(videoDetail?.id);
        })
        .catch(() => {
          toast.error("Something went wrong");
        });
    }
  };
  function startPressTimer(callback, post, index) {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      callback(post, index);
    }, 1000);
  }

  function handleOnClickEmpowerModal(e, callback) {
    if (isLongPressEmpower.current) {
      return;
    }
    callback();
  }

  function startPressTimerModal(callback, post, index) {
    isLongPressEmpower.current = false;
    timerRefModal.current = setTimeout(() => {
      isLongPressEmpower.current = true;
      callback(post, index);
    }, 1000);
  }
  function handleOnMouseDownModal(e, callback, post, index) {
    startPressTimer(callback, post, index);
  }
  function handleOnMouseUpModal() {
    clearTimeout(timerRefModal.current);
  }
  function handleOnTouchStartModal(e, callback, post, index) {
    startPressTimer(callback, post, index);
  }
  function handleOnTouchEndModal() {
    clearTimeout(timerRefModal.current);
  }

  const onClickAddComment = async (empowerCoin, cb) => {
    if (!user?.token) {
      navigate("/login");
      return toast("You have to login to add comments");
    } else {
      if (empowerCoin) {
        setErrorAddComment("");
        let obj = {};
        obj["account"] = user?.account?.id;
        obj["description"] = commentValue;
        obj["video"] = videoDetail?.id;
        obj["power"] = empowerCoin;
        const response = await postRequest({
          API: API_END_POINTS.ADD_COMMENT,
          DATA: obj,
        });
        if (response?.status === 200) {
          getComment(videoDetail?.id);
          setCommentValue("");
          dispatch(
            updateDetails({ power: user?.account?.power - empowerCoin })
          );
          cb();
        } else {
          toast(response?.data || "Some thing went wrong");
        }
      } else {
        setErrorAddComment("Pleas add coin");
        toast("Please add coin.");
      }
    }
  };

  const onClickEmpower = async () => {
    if (!user?.token) {
      navigate("/login");
      return toast("You have to login to empower");
    }
    let body = {};
    let url = "";
    if (videoDetail?.empower && videoDetail?.empower?.length) {
      body["power"] = videoDetail?.empower?.length;
      url = `${API_END_POINTS.REMOVE_POWER_VIDEO}${videoDetail.id}`;
    } else {
      body["power"] = 1;
      body["videoId"] = videoDetail.id;
      url = API_END_POINTS.ADD_POWER_TO_VIDEO;
    }
    const response = await postRequest({ API: url, DATA: body });
    if (response.status === 200) {
      if (response?.data?.video) {
        let video = { ...videoDetail };
        if (video?.empowered) {
          video.empowered++;
        } else {
          video["empowered"] = parseInt(video?.empowered || 0) + 1;
        }
        video["power"] = parseInt(response?.data?.video.power);
        if (parseInt(user?.account?.power) > 0) {
          dispatch(updateDetails({ power: user?.account?.power - 1 }));
        }
        setVideoDetail(video);
      }
    } else {
      toast(response?.data || "Something went wrong");
    }
  };

  const onClickEdit = () => {
    navigate(`/video/edit/${videoDetail?.id}`);
  };

  const handleCloseModal = () => {
    setOpenDeleteVideoModal(false);
  };

  const onClickDelete = () => {
    setOpenDeleteVideoModal(true);
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
    <div>
      <Header />
      <div className="home_page admin_wraper full">
        <ProgressBar
          bgcolor="orange"
          coinsUsed={videoDetail?.powerTransferred}
          coinsAssigned={videoDetail?.power}
          height={30}
          lineHeight="24px"
          className="progress-bar"
          iconClassName="icon-bar"
        />
        <div className="home_profile">
          <div
            className="home-img-text cursor-point"
            onClick={() => onClickProfile(videoDetail?.account?.id)}
          >
            <div className="home-img">
              <img alt="" src={`${IMAGE_URL}${videoDetail?.account?.pfp}`} />
            </div>
            <div className="home-head">
              <h2>{`${videoDetail?.account?.firstName} ${videoDetail?.account?.lastName}`}</h2>
              <div className="content_botom">
                <TitleIcon title={title} />
                <span>{title} </span>
              </div>
            </div>
          </div>
          {user?.account?.id !== videoDetails?.data?.video?.account?.id && (
            <div className="home-right">
              <p className="power_p">
                Earn 1 <PowersCoinDark className="power-icon" />
                By Watching This Video
              </p>
            </div>
          )}
          {user?.account?.id === videoDetails?.data?.video?.account?.id && (
            <>
              <button onClick={() => onClickEdit()} className="editBtn">
                edit
              </button>
              <button className="deleteBtn" onClick={onClickDelete}>
                delete
              </button>
              <DeleteVideoModal
                isOpen={openDeleteVideoModal}
                id={videoDetail?.id}
                handleClose={handleCloseModal}
              />
            </>
          )}
        </div>
        <div className="full-img">
          <Video
            src={videoDetail?.url}
            poster={videoDetail?.thumbnail}
            onEnded={() => handleFullWatch(user?.account)}
            controls
            autoPlay
            width="300"
            height="200"
            isShowControls
          />
        </div>
        <div className="ul_div comments_ul">
          <ul>
            <li onClick={onClickEmpower}>
              {videoDetail.empowered ? <PowersCoinDark /> : <PowersCoinLight />}
              <span>EMPOWER{`(${videoDetail?.empowered || 0})`}</span>
            </li>
          </ul>
        </div>
        <CommentComponent
          onClickAddComment={(empowerCoin, cb) =>
            onClickAddComment(empowerCoin, cb)
          }
          errorAddComment={errorAddComment}
          commentList={commentList}
          setCommentList={setCommentList}
          onClickEmpowerModal={onClickEmpowerModal}
          onRemoveEmpower={onRemoveEmpower}
          handleOnClickEmpowerModal={handleOnClickEmpowerModal}
          startPressTimerModal={startPressTimerModal}
          handleOnMouseDownModal={handleOnMouseDownModal}
          handleOnMouseUpModal={handleOnMouseUpModal}
          handleOnTouchStartModal={handleOnTouchStartModal}
          handleOnTouchEndModal={handleOnTouchEndModal}
          videoDetail={videoDetail}
          commentValue={commentValue}
          setCommentValue={setCommentValue}
          getComment={(id) => getComment(id)}
        />
      </div>
    </div>
  );
};

export default VideoDetail;
