import { useState, useRef, useEffect } from "react";

// custom components
import LoaderSpiner from "components/Loader";
import HomeHeader from "components/HomeHeader";
import ProgressBar from "components/ProgressBar";
import TitleIcon from "components/TitleIcon";
import DeleteVideoModal from "./DeleteVideoModal/DeleteVideoModal";
import CommentComponent from "components/CommentComponent";
import AvailableCoinModal from "components/Modal/AvailableCoinModal";
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
import { ReactComponent as SpecialCoinIconDark } from "assets/icons/Location_4_Gladiator_A.svg";
import { ReactComponent as SpecialCoinIconLight } from "assets/icons/locations-light.svg";

// styles
import styles from "./styles.module.scss";

// api
import { deleteRequest, getRequest, postRequest } from "helper/api";
import { toast } from "react-toastify";

// redux
import { logout, updateDetails } from "redux/sharedSlices/user";

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
  const {
    data: videoDetails,
    loading,
    refetch,
  } = useGetApiOnMount(`${API_END_POINTS?.GET_VIDEO_DETAIL}${params?.videoId}`);
  const userDetail = useSelector((state) => state?.user?.value?.account);
  const [commentValue, setCommentValue] = useState("");
  const [openDeleteVideoModal, setOpenDeleteVideoModal] = useState(false);
  const [showEmpowerModal, setShowEmpowerModal] = useState(false);
  const [showSpecialEmpowerModal, setShowSpecialEmpowerModal] = useState(false);
  const [empowerCoinsError, setEmpowerCoinsError] = useState("");
  const [empowerCoin, setEmpowerCoin] = useState(0);
  const [specialEmpowerCoin, setSpecialEmpowerCoin] = useState(0);
  const [availableCoin, setAvailableCoin] = useState(user?.account?.power);
  const [availableSpecialCoin, setAvailableSpecialCoin] = useState(0);
  const [isEmpowerOne, setIsEmpowerOne] = useState(false);
  const [empowerOnesDetail, setEmpowerOnesDetail] = useState(null);
  const [coinToMove, setCoinToMove] = useState(1);

  const timerRef = useRef();
  const isLongPress = useRef();
  const isLongPressEmpower = useRef();
  const timerRefModal = useRef();
  const timerRefEmpower = useRef();
  const isLongPressRef = useRef();

  const getEmpowerOnes = async () => {
    try {
      if (user) {
        const response = await getRequest({
          API: `${API_END_POINTS.GET_EMPOWERONES}/${user?.account?.id}`,
        });
        if (response?.success) {
          if (response?.data?.empowerONE) {
            setIsEmpowerOne(true);
            setEmpowerOnesDetail(response?.data?.empowerONE);
            if (response.data.empowerONE.country) {
              setAvailableSpecialCoin(response.data.empowerONE.country.power);
            } else if (response.data.empowerONE.state) {
              setAvailableSpecialCoin(response.data.empowerONE.state.power);
            } else {
              setAvailableSpecialCoin(response.data.empowerONE.city.power);
            }
          }
        } else if (response?.status === 401) {
          navigate("/login");
          dispatch(logout());
        } else {
          toast(response.data || "Something went wrong");
        }
      }
    } catch (error) {
      toast.error("Something went wrong !");
    }
  };
  useEffect(() => {
    if (user) {
      getEmpowerOnes();
    }
  }, [user]);

  function startPressEmpowerTimer(callback) {
    if (videoDetail?.empowered || videoDetail?.specialEmpowered) {
      isLongPressRef.current = false;
      timerRefEmpower.current = setTimeout(() => {
        isLongPressRef.current = true;
        callback();
      }, 1000);
    }
  }
  function handleOnMouseDown(callback) {
    startPressEmpowerTimer(callback);
  }

  function handleOnMouseUp() {
    clearTimeout(timerRefEmpower.current);
  }

  function handleOnTouchStart(callback) {
    startPressEmpowerTimer(callback);
  }

  function handleOnTouchEnd() {
    clearTimeout(timerRefEmpower.current);
  }

  useEffect(() => {
    if (videoDetails?.video) {
      setVideoDetail(videoDetails?.video);
    }
  }, [videoDetails]);

  const handleFullWatch = async (account) => {
    try {
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
        if (response.success) {
          let video = { ...videoDetail };
          if (response.data.account.power !== previousCoinCount) {
            video.powerTransferred += 1;

            setVideoDetail(video);
          }
          dispatch(updateDetails({ power: response.data.account.power }));
        } else if (response?.status === 401) {
          navigate("/login");
          dispatch(logout());
        } else {
          toast(response.data || "Something went wrong");
        }
      }
    } catch (error) {
      toast.error("Something went wrong !");
    }
  };

  const onClickEmpowerModal = async (post, coin, succesCallback) => {
    try {
      if (user?.account?.power > 0) {
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
        if (response?.success) {
          getComment(videoDetail?.id);
          if (succesCallback) succesCallback();
        } else {
          toast(response?.data || "Some thing went wrong");
        }
      }
    } catch (error) {
      toast.error("Something went wrong !");
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
            updateDetails({
              power: parseFloat(
                parseInt(user?.account?.power) + (total || 0)
              ).toFixed(1),
            })
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
    try {
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
          if (response?.success) {
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
    } catch (error) {
      toast.error("Something went wrong !");
    }
  };

  const onClickEmpower = async () => {
    if (!user?.token) {
      navigate("/login");
      return toast("You have to login to empower");
    }
    let body = {};
    let url = "";
    try {
      if (videoDetail?.empowered) {
        body["power"] = videoDetail?.empowered;
        url = `${API_END_POINTS.REMOVE_POWER_VIDEO}${videoDetail.id}`;
      } else {
        body["power"] = 1;
        body["videoId"] = videoDetail.id;
        url = API_END_POINTS.ADD_POWER_TO_VIDEO;
      }
      const response = await postRequest({ API: url, DATA: body });
      if (response?.success) {
        if (response?.data?.video) {
          let video = { ...videoDetail };
          if (video?.empowered) {
            video["empowered"] = response?.data?.empowered || 0;
            // video.empowered++;
          } else {
            video["empowered"] = video?.empowered + 1;
          }
          video["power"] = response?.data?.video.power;
          // if (parseInt(user?.account?.power) > 0) {
          //   dispatch(updateDetails({ power: user?.account?.power - 1 }));
          // }
          setVideoDetail(video);
        }
      }
    } catch (err) {
      toast(err?.data?.message || "Something went wrong");
    }
  };

  const onClickSpecialEmpower = async () => {
    if (!user?.token) {
      navigate("/login");
      return toast("You have to login to empower");
    }
    let body = {};
    let url = "";
    if (empowerOnesDetail) {
      if (videoDetail?.specialEmpowered) {
        body["locationId"] = empowerOnesDetail?.locationId;
        body["locationType"] = empowerOnesDetail?.locationType;
        body["power"] = videoDetail?.specialEmpowered;
        url = `${API_END_POINTS.REMOVE_SPECIAL_POWER_VIDEO}${videoDetail.id}`;
      } else {
        body["power"] = 1;
        body["videoId"] = videoDetail.id;
        body["locationId"] = empowerOnesDetail?.locationId;
        body["locationType"] = empowerOnesDetail?.locationType;
        url = API_END_POINTS.ADD_SPECIAL_POWER_TO_VIDEO;
      }
    }
    try {
      const response = await postRequest({ API: url, DATA: body });
      if (response?.success) {
        if (response?.data?.video) {
          let updateVideo = { ...videoDetail };
          if (updateVideo?.specialEmpowered) {
            updateVideo.specialEmpowered =
              response?.data?.specialEmpowered || 0;
          } else {
            updateVideo.specialEmpowered = updateVideo.specialEmpowered + 1;
            // video["specialEmpowered"] = video?.specialEmpowered + 1;
          }
          updateVideo["power"] = response?.data?.video.power;
          setVideoDetail(updateVideo);
        }
      } else {
        toast(response?.data?.message || "Something went wrong");
      }
    } catch (err) {
      toast(err?.data?.message || "Something went wrong");
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
  function handleOnClick(callback) {
    if (isLongPress.current) {
      return;
    }
    callback();
  }

  const openModal = () => {
    setShowEmpowerModal(true);
  };

  const openSpecialModal = () => {
    setShowSpecialEmpowerModal(true);
  };

  if (loading) {
    return <LoaderSpiner />;
  }

  const handleEmpower = async () => {
    if (!user?.token) {
      navigate("/login");
      return toast("You have to login to add comments");
    }

    if (empowerCoin === 0) {
      setEmpowerCoinsError("Empower coin is required");
      return;
    }
    let body = {
      power: empowerCoin,
      videoId: videoDetail?.id,
    };
    const response = await postRequest({
      API: API_END_POINTS.ADD_POWER_TO_VIDEO,
      DATA: body,
    });
    try {
      if (response?.success) {
        let updatePost = { ...videoDetail };
        if (updatePost?.length) {
          updatePost["empowered"] = videoDetail?.empowered + empowerCoin;
          updatePost["power"] = response?.data?.video?.power;
          if (parseInt(user?.account?.power) > 0) {
            dispatch(
              updateDetails({ power: user?.account?.power - empowerCoin })
            );
          }
          setVideoDetail(updatePost);
        }
        setShowEmpowerModal(false);
        refetch();
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data?.message || "Something went wrong");
      }
    } catch (err) {
      toast(err?.data?.message || "Something went wrong");
    }
  };

  const handleSpecialEmpower = async () => {
    try {
      if (!user?.token) {
        navigate("/login");
        return toast("You have to login to add comments");
      }

      if (specialEmpowerCoin === 0) {
        setEmpowerCoinsError("Empower coin is required");
        return;
      }
      let body = {
        power: specialEmpowerCoin,
        videoId: videoDetail?.id,
        locationId: empowerOnesDetail?.locationId,
        locationType: empowerOnesDetail?.locationType,
      };
      const response = await postRequest({
        API: API_END_POINTS.ADD_SPECIAL_POWER_TO_VIDEO,
        DATA: body,
      });
      if (response?.success) {
        let updatePost = { ...videoDetail };
        if (updatePost) {
          updatePost["specialEmpowered"] =
            videoDetail?.specialEmpowered + specialEmpowerCoin || 0;
          updatePost["power"] = response?.data?.video.power;
          if (
            parseInt(empowerOnesDetail?.country?.power) > 0 ||
            parseInt(empowerOnesDetail?.state?.power) > 0 ||
            parseInt(empowerOnesDetail?.city?.power) > 0
          ) {
            if (empowerOnesDetail.country) {
              empowerOnesDetail.country.power =
                empowerOnesDetail.country.power - specialEmpowerCoin;
            } else if (empowerOnesDetail.state) {
              empowerOnesDetail.state.power =
                empowerOnesDetail.state.power - specialEmpowerCoin;
            } else {
              empowerOnesDetail.city.power =
                empowerOnesDetail.city.power - specialEmpowerCoin;
            }
          }
          setVideoDetail(updatePost);
        }
        setShowSpecialEmpowerModal(false);
        setSpecialEmpowerCoin(0);
        // refetch();
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.log(err, "er");
      toast(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <HomeHeader text={"Video Detail"} />

      {Object.keys(videoDetail)?.length > 0 ? (
        <div
          className={`${styles.home_page} ${styles.admin_wraper} ${styles.full}`}
        >
          <ProgressBar
            bgcolor="orange"
            coinsUsed={videoDetail?.powerTransferred}
            coinsAssigned={videoDetail?.power}
            height={30}
            lineHeight="24px"
            className={styles.progress_bar}
            iconClassName={styles.icon_bar}
          />
          <div className={styles.home_profile}>
            <div
              className={`${styles.cursor_point} ${styles.home_img_text}`}
              onClick={() => onClickProfile(videoDetail?.account?.id)}
            >
              <div className={styles.home_img}>
                <img alt="" src={`${IMAGE_URL}${videoDetail?.account?.pfp}`} />
              </div>
              <div className={styles.home_head}>
                <h2>{`${videoDetail?.account?.firstName} ${videoDetail?.account?.lastName}`}</h2>
                <div className={styles.content_botom}>
                  <TitleIcon />
                  <span>{videoDetail?.title} </span>
                </div>
              </div>
            </div>
            {user?.account?.id !== videoDetails?.video?.account?.id && (
              <div className={styles.home_right}>
                <p className={styles.power_p}>
                  Earn 1 <PowersCoinDark className={styles.power_icon} />
                  By Watching This Video
                </p>
              </div>
            )}
            {user?.account?.id === videoDetails?.video?.account?.id && (
              <div>
                <button
                  onClick={() => onClickEdit()}
                  className={styles.editBtn}
                >
                  edit
                </button>
                <button className={styles.deleteBtn} onClick={onClickDelete}>
                  delete
                </button>
                <DeleteVideoModal
                  isOpen={openDeleteVideoModal}
                  id={videoDetail?.id}
                  handleClose={handleCloseModal}
                />
              </div>
            )}
          </div>
          <div className={styles.full_img}>
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
          <div className={`${styles.ul_div} ${styles.comments_ul}`}>
            <ul>
              {isEmpowerOne && (
                <li
                  onClick={() => {
                    handleOnClick(() => {
                      onClickSpecialEmpower();
                    });
                  }}
                  onMouseDown={() => handleOnMouseDown(openSpecialModal)}
                  onMouseUp={handleOnMouseUp}
                  onTouchStart={() => handleOnTouchStart(openSpecialModal)}
                  onTouchEnd={handleOnTouchEnd}
                >
                  {" "}
                  {videoDetail?.specialEmpowered ? (
                    <SpecialCoinIconDark />
                  ) : (
                    <SpecialCoinIconLight />
                  )}
                  <span>VIP{`(${videoDetail?.specialEmpowered})`}</span>
                </li>
              )}
              <li
                onClick={() => {
                  handleOnClick(() => {
                    onClickEmpower();
                  });
                }}
                onMouseDown={() => handleOnMouseDown(openModal)}
                onMouseUp={handleOnMouseUp}
                onTouchStart={() => handleOnTouchStart(openModal)}
                onTouchEnd={handleOnTouchEnd}
              >
                {videoDetail.empowered ? (
                  <PowersCoinDark />
                ) : (
                  <PowersCoinLight />
                )}
                <span>EMPOWER{`(${videoDetail?.empowered || 0})`}</span>
              </li>
            </ul>
          </div>
          <AvailableCoinModal
            showModal={showEmpowerModal}
            setCoinToMove={setCoinToMove}
            handleCloseModal={() => setShowEmpowerModal(false)}
            coinToMove={coinToMove}
            empowerCoinsError={empowerCoinsError}
            handleEmpower={handleEmpower}
            setEmpowerCoinsError={setEmpowerCoinsError}
            setEmpowerCoin={setEmpowerCoin}
            empowerCoin={empowerCoin}
            setAvailableCoin={setAvailableCoin}
            availableCoin={availableCoin}
          />
          <AvailableCoinModal
            showModal={showSpecialEmpowerModal}
            setCoinToMove={setCoinToMove}
            handleCloseModal={() => setShowSpecialEmpowerModal(false)}
            coinToMove={coinToMove}
            empowerCoinsError={empowerCoinsError}
            handleEmpower={handleSpecialEmpower}
            setEmpowerCoinsError={setEmpowerCoinsError}
            setEmpowerCoin={setSpecialEmpowerCoin}
            empowerCoin={specialEmpowerCoin}
            setAvailableCoin={setAvailableSpecialCoin}
            availableCoin={availableSpecialCoin}
          />
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
      ) : (
        <p>No video found.</p>
      )}
    </div>
  );
};

export default VideoDetail;
