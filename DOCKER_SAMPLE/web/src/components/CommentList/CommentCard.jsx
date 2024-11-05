import { useRef, useState } from "react";

// library utils
import { toast } from "react-toastify";

// custom components
import EmpowerCoinModal from "../EarnComponents/EmpowerCoinModal";

// hooks
import { useSelector } from "react-redux";

// assets
import { ReactComponent as Deletes } from "assets/icons/trash-can-regular.svg";
import { ReactComponent as PowersCoinLight } from "assets/icons/power-coin-light.svg";
import { ReactComponent as PowersCoinDark } from "assets/icons/power-coin-dark.svg";

//styles
import "./styles.scss";

const CommentCard = ({
  openModalDelete = () => { },
  name = "",
  comment = "",
  post = {},
  index = "",
  onClickEmpowerModal = () => { },
  profileImage = "",
  empower = [],
  onRemoveEmpower = () => { },
}) => {
  const user = useSelector((state) => state.user.value);
  const [availableCoin, setAvailableCoin] = useState(user?.account?.power);
  const [coinToMove, setCoinToMove] = useState(1);
  const [empowerCoin, setEmpowerCoin] = useState(0);
  const [empowerCoinsError, setEmpowerCoinsError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [postDetail, setPostDetail] = useState({});
  const isLongPress = useRef();
  const timerRef = useRef();

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

  function handleOnClick(callback) {
    if (isLongPress.current) {
      return;
    }
    callback();
  }

  const openModal = (detail, index) => {
    setShowModal(true);
    setPostDetail({ ...detail, index: index });
  };

  const closeModal = () => {
    setShowModal(false);
    setPostDetail({});
  };

  const onClickIncreaseDecrease = (condition = "") => {
    if (parseInt(availableCoin) > 0) {
      if (coinToMove > availableCoin) {
        setEmpowerCoinsError("");
      }
      if (condition === "available") {
        if (availableCoin >= 0 && availableCoin !== 0) {
          setAvailableCoin((prev) => {
            if (prev > 0 && prev >= parseInt(coinToMove)) {
              return prev - parseInt(coinToMove);
            } else {
              return prev;
            }
          });
          setEmpowerCoin((prev) => {
            if (prev >= 0 && availableCoin >= parseInt(coinToMove)) {
              return prev + parseInt(coinToMove);
            } else {
              return prev;
            }
          });
        }
      } else {
        if (coinToMove >= 0 && coinToMove !== 0) {
          setAvailableCoin((prev) => {
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

  return (
    <div className="noti-box" key={post?.id}>
      <div className="noti-img">
        <img src={profileImage} height={"35px"} width={"35px"} alt="" />
      </div>
      <div className="noti-contents">
        <div className="delet-icon">
          <h5>{name}</h5>
          {user?.token && user?.account?.id === post?.account?.id ? (
            <span onClick={() => openModalDelete(post)}>
              <Deletes />
            </span>
          ) : null}
        </div>
        <p>{comment}</p>
        <div className="ul_div comments_ul">
          <ul>
            <li
              onClick={() =>
                handleOnClick(() => {
                  if (empower?.length) {
                    onRemoveEmpower(post);
                  } else {
                    onClickEmpowerModal(post, 1);
                  }
                })
              }
              onMouseDown={() => handleOnMouseDown(openModal, post, index)}
              onMouseUp={() => handleOnMouseUp()}
              onTouchEnd={() => handleOnTouchEnd()}
              onTouchStart={() => handleOnTouchStart(openModal, post, index)}
            >
              {empower?.length > 0 ? <PowersCoinDark /> : <PowersCoinLight />}
              <span>{`(${post?.power})`}</span>
            </li>
          </ul>
        </div>
      </div>

      <EmpowerCoinModal
        availableCoin={availableCoin}
        coinToMove={coinToMove}
        empowerCoin={empowerCoin}
        postDetail={postDetail}
        onClickIncreaseDecrease={onClickIncreaseDecrease}
        setCoinToMove={setCoinToMove}
        setEmpowerCoinsError={setEmpowerCoinsError}
        empowerCoinsError={empowerCoinsError}
        showModal={showModal}
        isLoading={false}
        handleCloseModal={closeModal}
        handleEmpower={onClickEmpowerModal}
        succesCallback={() => {
          closeModal();
        }}
      />
    </div>
  );
};

export default CommentCard;
