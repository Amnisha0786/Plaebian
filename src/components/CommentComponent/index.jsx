import React, { useEffect, useState } from "react";

// library utils
import { toast } from "react-toastify";

// custom components
import ConfirmDeleteCommentModal from "../EarnComponents/ConfirmDeleteCommentModal";
import CommentCard from "../CommentList/CommentCard";
import CoinMove from "../CoinMove";

// hooks
import { useSelector } from "react-redux";

// config
import { IMAGE_URL } from "../../config";

// styles
// import "./styles.scss"

import styles from "./styles.module.scss";

// api
import { deleteRequest } from "helper/api";

const CommentComponent = ({
  onClickAddComment = () => {},
  errorAddComment = () => {},
  commentList = [],
  onClickEmpowerModal = () => {},
  handleOnClickEmpowerModal = () => {},
  startPressTimerModal = () => {},
  handleOnMouseDownModal = () => {},
  handleOnMouseUpModal = () => {},
  handleOnTouchStartModal = () => {},
  handleOnTouchEndModal = () => {},
  videoDetail = {},
  getComment = () => {},
  onRemoveEmpower = () => {},
  commentValue = "",
  setCommentValue = () => {},
}) => {
  const user = useSelector((state) => state.user.value);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [availableCoins, setAvailableCoins] = useState(
    user?.account?.power || 0
  );
  const [empowerCoin, setEmpowerCoin] = useState(0);

  const [empowerCoinsError, setEmpowerCoinsError] = useState("");

  const [coinToMove, setCoinToMove] = useState(1);

  const [commentDetail, setCommentDetail] = useState({});

  useEffect(() => {
    setAvailableCoins(user?.account?.power);
  }, [user?.account?.power]);

  const handleCommentChange = (e) => {
    setCommentValue(e.target.value);
  };

  const handleCloseModalDelete = () => {
    setShowDeleteModal(false);
  };

  const handleCoinToMoveChange = (e) => {
    setCoinToMove(e.target.value);
  };

  const openModalDelete = (comment) => {
    setCommentDetail(comment);
    setShowDeleteModal(true);
  };

  const onClickIncreaseDecreaseModal = (condition = "") => {
    if (parseInt(availableCoins) > 0) {
      if (coinToMove > availableCoins) {
        setEmpowerCoinsError("");
      }
      if (condition === "available") {
        if (availableCoins >= 0 && availableCoins !== 0) {
          setAvailableCoins((prev) => {
            if (prev > 0 && prev >= parseInt(coinToMove)) {
              return prev - parseInt(coinToMove);
            } else {
              return prev;
            }
          });
          setEmpowerCoin((prev) => {
            if (prev >= 0 && availableCoins >= parseInt(coinToMove)) {
              return prev + parseInt(coinToMove);
            } else {
              return prev;
            }
          });
        }
      } else {
        if (coinToMove >= 0 && coinToMove !== 0) {
          setAvailableCoins((prev) => {
            if (prev >= 0 && empowerCoin >= parseInt(coinToMove)) {
              return prev + parseInt(coinToMove);
            } else {
              return prev;
            }
          });
          setEmpowerCoin((prev) => {
            if (prev > 0 && prev >= parseInt(coinToMove)) {
              return prev - parseInt(coinToMove);
            } else {
              return prev;
            }
          });
        }
      }
    } else {
      toast("You have not sufficient coins to move.");
    }
  };

  const onDelete = async () => {
    await deleteRequest({ API: `comment/${commentDetail?.id}` });
    getComment(videoDetail?.id);
    setShowDeleteModal(false);
  };
  return (
    <>
      <div className={`${styles.notifications} ${styles.commentss} `}>
        <div className={styles.noti_title}>
          <h2>Comments</h2>
        </div>

        <div className={styles.noti_forms}>
          <textarea
            id="w3review"
            name="w3review"
            rows="4"
            cols="50"
            placeholder="Please Add Comments  "
            value={commentValue}
            onChange={handleCommentChange}
          ></textarea>
          <CoinMove
            onChangeInput={handleCoinToMoveChange}
            moveCoinValue={coinToMove}
            availableCoin={availableCoins}
            empowerCoin={empowerCoin}
            onClickIncreaseDecrease={(value) =>
              onClickIncreaseDecreaseModal(value)
            }
          />
          <button
            onClick={() =>
              onClickAddComment(empowerCoin, () => {
                setEmpowerCoin(0);
              })
            }
            className={`${styles.btn} ${styles.btn_add}`}
          >
            Add Comment
          </button>
          {errorAddComment ? <span>{errorAddComment}</span> : null}
        </div>
        <div className={styles.noti_main}>
          {commentList.length
            ? commentList?.map((item) => (
                <CommentCard
                  post={item}
                  key={item?.id}
                  name={`${item?.account?.firstName} ${item?.account?.firstName}`}
                  profileImage={`${IMAGE_URL}${item?.account?.pfp}`}
                  comment={item?.description}
                  openModalDelete={(comment) => openModalDelete(comment)}
                  onClickEmpowerModal={onClickEmpowerModal}
                  handleOnClickEmpowerModal={handleOnClickEmpowerModal}
                  startPressTimerModal={startPressTimerModal}
                  handleOnMouseDownModal={handleOnMouseDownModal}
                  handleOnMouseUpModal={handleOnMouseUpModal}
                  handleOnTouchStartModal={handleOnTouchStartModal}
                  handleOnTouchEndModal={handleOnTouchEndModal}
                  empower={item?.empower || []}
                  onRemoveEmpower={onRemoveEmpower}
                />
              ))
            : null}
        </div>
      </div>

      <div className={styles.rejected_modal}>
        <ConfirmDeleteCommentModal
          showModal={showDeleteModal}
          handleCloseModalDelete={handleCloseModalDelete}
          handleDeleteConfirm={() => onDelete()}
        />
      </div>
    </>
  );
};

export default CommentComponent;
