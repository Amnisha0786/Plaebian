import { useState, useRef } from "react";

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
import { updateDetails } from "redux/sharedSlices/user";

// config
import { API_URL } from "config";

// utils
import { getTitle } from "common/utils";
import { deleteRequest, postRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

// styles
import "./styles.scss";

const Earn = () => {
  const user = useSelector((state) => state.user?.value);
  const isLoading = useSelector((state) => state.loader?.isLoading);
  const [showModal, setShowModal] = useState(false);
  const [showModalOne, setShowModalOne] = useState(false);
  const [coinToMove, setCoinToMove] = useState(1);

  const [errorAddComment, setErrorAddComment] = useState("");
  const [commentValue, setCommentValue] = useState("");
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
        API: `${API_URL}${API_END_POINTS.UNEMPOWER_COMMENT}${emp?.id}/${post?.id}`,
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

  const onClickEmpowerModal = async (post, coin, succesCallback) => {
    if (!user?.token) {
      userNotLogin();
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
      toast(response?.data || "Something went wrong");
    }
  };

  const onClickAddComment = async (empowerCoin, cb) => {
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
        if (response?.status === 200) {
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
  };

  return (
    <>
      {isLoading && <LoaderSpiner />}
      <HomeHeader text="Watch videos and earn power to promote your content" />
      <div className="home_page" id="scroll-container">
        {!!user?.account && (
          <p className="power_home">
            Your POWER Right Now Is
            <Bag />
            {parseInt(user?.account?.power || 0)}
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
              const title = getTitle(post.account?.followerCount);
              return (
                <EmpowerVideoComponent
                  post={post}
                  index={index}
                  key={post.id}
                  title={title}
                  setAllPost={setAllPost}
                  allPost={allPost}
                  handleFullWatch={handleFullWatch}
                  onClickEmpower={onClickEmpower}
                  handleOnMouseDown={handleOnMouseDown}
                  handleOnTouchStart={handleOnTouchStart}
                  handleOnMouseUp={handleOnMouseUp}
                  openModalComment={openModalComment}
                  isLongPress={isLongPress}
                  openModal={openModal}
                  handleOnTouchEnd={handleOnTouchEnd}
                />
              );
            })}
            <div ref={loader} />
          </InfiniteScroll>
        </div>
        <AvailableCoinModal
          showModal={showModalOne}
          setShowModal={setShowModalOne}
          setCoinToMove={setCoinToMove}
          setAllPost={setAllPost}
          isLoading={isLoading}
          handleCloseModal={handleCloseModal}
          coinToMove={coinToMove}
          videoDetail={videoDetail}
          allPost={allPost}
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
