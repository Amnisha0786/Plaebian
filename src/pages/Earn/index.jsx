import { useState, useRef, useEffect } from "react";

// Library components
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";

// Custom components
import CommentListModal from "components/CommentList";
import HomeHeader from "components/HomeHeader";
import ReferralCode from "components/ReferralCode";
import EmpowerVideoComponent from "components/EmpowerVideoComponent";
import LoaderSpiner from "components/Loader";
import AvailableCoinModal from "components/Modal/AvailableCoinModal";

// hooks
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useEmpower from "hooks/useEmpower";
import { useGetComment } from "hooks/useGetComment";

// images
import { ReactComponent as Bag } from "assets/icons/earn.svg";

// redux
import { logout, updateDetails } from "redux/sharedSlices/user";

// utils
import { formatNumberWithOneDecimal } from "common/utils";

//api
import { deleteRequest, getRequest, postRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

// styles
import styles from "./styles.module.scss";

const Earn = () => {
  const user = useSelector((state) => state.user?.value);
  const isLoading = useSelector((state) => state.loader?.isLoading);
  const [showModal, setShowModal] = useState(false);
  const [showModalOne, setShowModalOne] = useState(false);
  const [showSpecialEmpowerModal, setShowSpecialEmpowerModal] = useState(false);
  const [coinToMove, setCoinToMove] = useState(1);

  const [errorAddComment, setErrorAddComment] = useState("");
  const [commentValue, setCommentValue] = useState("");
  const [empowerCoinsError, setEmpowerCoinsError] = useState("");
  const [empowerCoin, setEmpowerCoin] = useState(0);
  const [specialEmpowerCoin, setSpecialEmpowerCoin] = useState(0);
  const [availableCoin, setAvailableCoin] = useState(user?.account?.power);
  const [availableSpecialCoin, setAvailableSpecialCoin] = useState(0);
  const [isEmpowerOne, setIsEmpowerOne] = useState(false);
  const [empowerOnesDetail, setEmpowerOnesDetail] = useState(null);

  const loader = useRef(null);
  const {
    allPost,
    setAllPost,
    totalCount,
    onClickEmpower,
    handleFullWatch,
    getData,
  } = useEmpower();
  const {
    commentList,
    getComment,
    setVideoDetail,
    setCommentList,
    videoDetail,
  } = useGetComment();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const timerRef = useRef();
  const isLongPress = useRef();

  const getEmpowerOnes = async () => {
    try {
      if (user) {
        const response = await getRequest({
          API: `${API_END_POINTS.GET_EMPOWERONES}/${user?.account?.id}`,
        });
        if (response?.data?.empowerONE) {
          setIsEmpowerOne(true);
          setEmpowerOnesDetail(response?.data?.empowerONE);
          if (response.data?.empowerONE?.country) {
            setAvailableSpecialCoin(response.data?.empowerONE?.country?.power);
          } else if (response.data?.empowerONE?.state) {
            setAvailableSpecialCoin(response.data?.empowerONE?.state?.power);
          } else {
            setAvailableSpecialCoin(response.data?.empowerONE?.city?.power);
          }
        }
      }
    } catch (error) {
      toast.error("Something went wrong !");
    }
  };
  useEffect(() => {
    if (user && user?.token) {
      getEmpowerOnes();
    }
  }, [user]);

  const onClickSpecialEmpower = async (post, index) => {
    if (!user?.token) {
      navigate("/login");
      return toast("You have to login for special empower");
    }
    let body = {};
    let url = "";
    if (empowerOnesDetail) {
      if (post?.specialEmpowered) {
        body["locationId"] = empowerOnesDetail?.locationId;
        body["locationType"] = empowerOnesDetail?.locationType;
        body["power"] = post?.specialEmpowered;
        url = `${API_END_POINTS.REMOVE_SPECIAL_POWER_VIDEO}${post.id}`;
      } else {
        body["power"] = 1;
        body["videoId"] = post.id;
        body["locationId"] = empowerOnesDetail?.locationId;
        body["locationType"] = empowerOnesDetail?.locationType;
        url = API_END_POINTS.ADD_SPECIAL_POWER_TO_VIDEO;
      }
    }
    try {
      const response = await postRequest({ API: url, DATA: body });
      if (response?.success) {
        if (response?.data?.video) {
          let updatePost = [...allPost];
          if (post?.specialEmpowered) {
            updatePost[index]["specialEmpowered"] =
              response?.data?.specialEmpowered || 0;
          } else {
            updatePost[index]["specialEmpowered"] = post?.specialEmpowered + 1;
          }
          updatePost[index]["power"] = response?.data?.video.power;
          setAllPost(updatePost);
        }
      } else {
        toast(response?.data || "Something went wrong");
      }
    } catch (err) {
      toast(err?.data?.message || "Something went wrong");
    }
  };

  function startPressTimer(callback, post, index) {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      callback(post, index);
    }, 1000);
  }
  function handleOnMouseDown(callback, post, index) {
    startPressTimer(callback, post, index);
  }

  function handleOnMouseUp() {
    clearTimeout(timerRef.current);
  }

  function handleOnTouchStart(callback, post, index) {
    startPressTimer(callback, post, index);
  }

  function handleOnTouchEnd() {
    clearTimeout(timerRef.current);
  }

  const openModal = (detail, index) => {
    setShowModalOne(true);
    setVideoDetail({ ...detail, index: index });
  };

  const openSpecialModal = (detail, index) => {
    setShowSpecialEmpowerModal(true);
    setVideoDetail({ ...detail, index: index });
  };

  const userNotLogin = () => {
    navigate("/login");
  };

  const openModalComment = (detail, index) => {
    if (!user?.token) {
      toast("You have to login to add comments");
      userNotLogin();
    }
    setShowModal(true);
    setVideoDetail({ ...detail, index: index });
  };

  const handleCloseModal = () => {
    setShowModalOne(false);
    setShowSpecialEmpowerModal(false);
  };

  const handleCloseModalComent = () => {
    setShowModal(false);
    getData();
  };

  const onRemoveEmpower = async (post) => {
    if (!user?.token) {
      userNotLogin();
    }
    const promises = post?.empower?.map((emp) =>
      deleteRequest({
        API: `${API_END_POINTS.UNEMPOWER_COMMENT}${emp?.id}/${post?.id}`,
      })
    );

    if (promises.length) {
      await Promise.all(promises)
        .then(() => {
          getComment(videoDetail?.id);
        })
        .catch(() => {
          toast.error("Something went wrong");
        });
    }
  };
  const onClickEmpowerModal = async (post, coin, succesCallback) => {
    if (!user?.token) {
      userNotLogin();
    }

    try {
      let body = {};
      let url = "";

      body["power"] = coin;
      body["comment"] = post.id;
      url = API_END_POINTS.EMPOWER_COMMENT;
      const response = await postRequest({ API: url, DATA: body });
      if (response.success) {
        getComment(videoDetail?.id);
        dispatch(updateDetails({ power: user?.account?.power - coin }));
        if (succesCallback) succesCallback();
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data || "Something went wrong");
      }
    } catch (error) {
      toast(error?.data?.message || error?.message || "Something went wrong");
    }
  };

  const onClickAddComment = async (empowerCoin, cb) => {
    try {
      if (!user?.token) {
        userNotLogin();
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
            toast(response?.data || "Something went wrong");
          }
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
              toast(response?.data || "Something went wrong");
            }
          } else {
            setErrorAddComment("Pleas add coin");
            toast("Please add coin.");
          }
        }
      }
    } catch (error) {
      toast.error("Something went wrong !");
    }
  };

  const handleEmpower = async () => {
    try {
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
      if (response?.success) {
        let updatePost = [...allPost];
        let index = videoDetail?.index;
        if (updatePost?.length) {
          updatePost[index]["empowered"] = videoDetail?.empowered + empowerCoin;
          updatePost[index]["power"] = response?.data?.video?.power;
          if (parseInt(user?.account?.power) > 0) {
            dispatch(
              updateDetails({ power: user?.account?.power - empowerCoin })
            );
          }
          setAllPost(updatePost);
        }
        setEmpowerCoin(0);
        setShowModalOne(false);
      } else if (response?.data.status === 401) {
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

      let locationId = empowerOnesDetail?.locationId;
      let body = {
        power: specialEmpowerCoin || 0,
        videoId: videoDetail?.id,
        locationId,
        locationType: empowerOnesDetail?.locationType,
      };
      const response = await postRequest({
        API: API_END_POINTS.ADD_SPECIAL_POWER_TO_VIDEO,
        DATA: body,
      });
      if (response?.success) {
        let updatePost = [...allPost];
        let index = videoDetail?.index;
        if (updatePost?.length) {
          updatePost[index]["specialEmpowered"] =
            videoDetail?.specialEmpowered + specialEmpowerCoin || 0;
          updatePost[index]["power"] = response?.data?.video?.power;
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
          setAllPost(updatePost);
        }
        setShowSpecialEmpowerModal(false);
        setSpecialEmpowerCoin(0);
      } else if (response?.data.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.log(err, "error");
      toast(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      {isLoading && <LoaderSpiner />}
      <HomeHeader text="Watch videos and earn power to promote your content" />
      <div className={styles.home_page} id="scroll-container">
        {!!user?.account && (
          <p className={styles.power_home}>
            Your POWER Right Now Is
            <Bag />
            {formatNumberWithOneDecimal(user?.account?.power || 0)}
          </p>
        )}

        {user?.account && <ReferralCode />}

        <div style={{ marginTop: !user?.account ? "1rem" : "0" }}>
          <InfiniteScroll
            dataLength={allPost?.length}
            next={getData}
            scrollableTarget="scroll-container"
            hasMore={allPost?.length !== totalCount}
          >
            {allPost?.map((post, index) => {
              return (
                <EmpowerVideoComponent
                  post={post}
                  index={index}
                  key={post.id}
                  title={post.title}
                  setAllPost={setAllPost}
                  allPost={allPost}
                  handleFullWatch={handleFullWatch}
                  onClickEmpower={onClickEmpower}
                  onClickSpecialEmpower={onClickSpecialEmpower}
                  handleOnMouseDown={handleOnMouseDown}
                  handleOnTouchStart={handleOnTouchStart}
                  handleOnMouseUp={handleOnMouseUp}
                  openModalComment={openModalComment}
                  isLongPress={isLongPress}
                  openModal={openModal}
                  openSpecialModal={openSpecialModal}
                  handleOnTouchEnd={handleOnTouchEnd}
                  isEmpowerOne={isEmpowerOne}
                />
              );
            })}
            <div ref={loader} />
          </InfiniteScroll>
        </div>
        <AvailableCoinModal
          showModal={showModalOne}
          setCoinToMove={setCoinToMove}
          isLoading={isLoading}
          handleCloseModal={handleCloseModal}
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
          isLoading={isLoading}
          handleCloseModal={handleCloseModal}
          coinToMove={coinToMove}
          empowerCoinsError={empowerCoinsError}
          handleEmpower={handleSpecialEmpower}
          setEmpowerCoinsError={setEmpowerCoinsError}
          setEmpowerCoin={setSpecialEmpowerCoin}
          empowerCoin={specialEmpowerCoin}
          setAvailableCoin={setAvailableSpecialCoin}
          availableCoin={availableSpecialCoin}
        />

        <CommentListModal
          showModal={showModal}
          onClickAddComment={onClickAddComment}
          errorAddComment={errorAddComment}
          commentList={commentList}
          setCommentList={setCommentList}
          onClickEmpowerModal={onClickEmpowerModal}
          onRemoveEmpower={onRemoveEmpower}
          handleCloseModal={handleCloseModalComent}
          videoDetail={videoDetail}
          commentValue={commentValue}
          setCommentValue={setCommentValue}
          getComment={getComment}
        />
      </div>
    </>
  );
};

export default Earn;
