import React, { useEffect, useState } from "react";

// library utils
import { toast } from "react-toastify";

// library components
import ReactModal from "react-modal";

// custom components
import ConfirmDeleteCommentModal from "../EarnComponents/ConfirmDeleteCommentModal";
import CommentCard from "./CommentCard";

// hooks
import { useSelector } from "react-redux";

// assets
import powerCoin from "assets/icons/power-coin.png";
import arrow from "assets/images/arrow.png";

// config
import { API_URL, IMAGE_URL } from "../../config";

const CommentListModal = ({
  showModal = false,
  onClickAddComment = () => { },
  errorAddComment = "",
  commentList = [],
  onClickEmpowerModal = () => { },
  handleCloseModal = () => { },
  videoDetail = {},
  getComment = () => { },
  onRemoveEmpower = () => { },
  commentValue = "",
  setCommentValue = () => { },
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
      toast("You have not sufficient coins to move.")
    }
  };

  const onDelete = async () => {
    const resUpload = await fetch(`${API_URL}comment/${commentDetail?.id}`, {
      method: "Delete",
      headers: {
        Authorization: "Bearer " + user?.token,
      },
    });
    await resUpload.json();
    getComment(videoDetail?.id);
    setShowDeleteModal(false);
  };

  return (
    <ReactModal isOpen={showModal}>
      <div className="notifications commentss">
        <div className="noti-title">
          <h2>Comments</h2>
        </div>

        <div className="noti-forms">
          <textarea
            id="w3review"
            name="w3review"
            rows="4"
            cols="50"
            placeholder="Please Add Comments"
            value={commentValue}
            onChange={handleCommentChange}
          ></textarea>
          <div className="form-group cust_cls">
            <div className="empower">
              <div className="total_coins">
                <label>Available Coins</label>
                <h3>
                  <em>
                    <img className="power-icon" src={powerCoin} alt="" />
                  </em>
                  {parseInt(availableCoins || 0)}
                </h3>
              </div>
              <div className="form-group">
                <span onClick={() => onClickIncreaseDecreaseModal("available")}>
                  <img src={arrow} alt="" />
                </span>
                <br />
                <span onClick={() => onClickIncreaseDecreaseModal()}>
                  <img src={arrow} className="bottom" alt="" />
                </span>
              </div>
              <div className="total_coins right_imgs">
                <label>Empower Coins</label>
                <h3>
                  <em>
                    <img className="power-icon" src={powerCoin} alt="" />
                  </em>
                  {empowerCoin}
                </h3>
              </div>
            </div>
            {errorAddComment || empowerCoinsError ? (
              <span className="error-coin">{errorAddComment || empowerCoinsError}</span>
            ) : null}
            <div className="flex-column class_coininput">
              <label>
                Coin to move
                <input
                  type="number"
                  placeholder="Coin"
                  name="assignedCoins"
                  onChange={handleCoinToMoveChange}
                  value={coinToMove}
                />
              </label>
            </div>
          </div>
          <button
            onClick={() =>
              onClickAddComment(empowerCoin, () => {
                if (!errorAddComment) setEmpowerCoin(0);
              })
            }
            className="btn btn_add"
          >
            Add Comment
          </button>
        </div>
        <div className="noti-main">
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
                empower={item?.empower || []}
                onRemoveEmpower={onRemoveEmpower}
              />
            ))
            : null}
        </div>
      </div>
      <button onClick={handleCloseModal} className="close-button">
        Close Modal
      </button>

      <div className="rejected_modal">
        <ConfirmDeleteCommentModal
          showModal={showDeleteModal}
          handleCloseModalDelete={handleCloseModalDelete}
          handleDeleteConfirm={() => onDelete()}
        />
      </div>
    </ReactModal>
  );
};

export default CommentListModal;
