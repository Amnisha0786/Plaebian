import React, { useEffect, useState } from "react";

// styling
import styles from "./styles.module.scss";

// library utils
import { toast } from "react-toastify";

// custom components
import ConfirmDeleteCommentModal from "../EarnComponents/ConfirmDeleteCommentModal";
import CommentCard from "./CommentCard";
import Modal from "components/Modal/common/Modal";

// hooks
import { useSelector } from "react-redux";

// assets
import powerCoin from "assets/icons/power-coin.png";
import arrow from "assets/images/arrow.png";

// config
import { IMAGE_URL } from "../../config";

// api
import { deleteRequest } from "helper/api";

const CommentListModal = ({
  showModal = false,
  onClickAddComment = () => {},
  errorAddComment = "",
  commentList = [],
  onClickEmpowerModal = () => {},
  handleCloseModal = () => {},
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
    <Modal
      isOpen={showModal}
      handleCloseModal={handleCloseModal}
      modalClass={styles.emm_modal}
    >
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
            placeholder="Please Add Comments"
            value={commentValue}
            onChange={handleCommentChange}
          ></textarea>
          <div className={`${styles.form_group} ${styles.cust_cls}`}>
            <div className={styles.empower}>
              <div className={styles.total_coins}>
                <label>Available Coins</label>
                <h3>
                  <em>
                    <img
                      className={styles.power_icon}
                      src={powerCoin}
                      alt=""
                      width={30}
                      height={30}
                    />
                  </em>
                  {parseInt(availableCoins || 0)}
                </h3>
              </div>
              <div className={styles.form_group}>
                <span onClick={() => onClickIncreaseDecreaseModal("available")}>
                  <img src={arrow} alt="" />
                </span>
                <br />
                <span onClick={() => onClickIncreaseDecreaseModal()}>
                  <img src={arrow} className={`${styles.bottom}`} alt="" />
                </span>
              </div>
              <div className={`${styles.total_coins} ${styles.right_imgs}`}>
                <label>Empower Coins</label>
                <h3>
                  <em>
                    <img
                      className={styles.power_icon}
                      src={powerCoin}
                      alt=""
                      width={30}
                      height={30}
                    />
                  </em>
                  {empowerCoin}
                </h3>
              </div>
            </div>
            {errorAddComment || empowerCoinsError ? (
              <span className={styles.error_coin}>
                {errorAddComment || empowerCoinsError}
              </span>
            ) : null}
            <div className={`${styles.flex_column} ${styles.class_coininput}`}>
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
            className={`${styles.btn} ${styles.btn_add}`}
          >
            Add Comment
          </button>
        </div>
        <div className={`${styles.noti_main}`}>
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
      {/* <button onClick={handleCloseModal} className={`${styles.close_button}`}>
        Close Modal
      </button> */}

      <div className={styles.rejected_modal}>
        <ConfirmDeleteCommentModal
          showModal={showDeleteModal}
          handleCloseModalDelete={handleCloseModalDelete}
          handleDeleteConfirm={() => onDelete()}
        />
      </div>
    </Modal>
  );
};

export default CommentListModal;
