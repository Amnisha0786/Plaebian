import { useState } from "react";

// library components
import ReactModal from "react-modal";

// custom components
import CoinMove from "../CoinMove";

// hooks
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// api
import { API_END_POINTS } from "common/apiConstants";
import { postRequest } from "helper/api";

// utils
import { toast } from "react-toastify";

// redux
import { updateDetails } from "redux/sharedSlices/user";

const AvailableCoinModal = ({
  showModal = false,
  setCoinToMove,
  isLoading,
  handleCloseModal,
  coinToMove,
  videoDetail,
  allPost = [],
  setAllPost = () => { },
  setShowModal = () => { },
}) => {
  const user = useSelector((state) => state.user?.value);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [availableCoin, setAvailableCoin] = useState(user?.account?.power);
  const [empowerCoin, setEmpowerCoin] = useState(0);
  const [empowerCoinsError, setEmpowerCoinsError] = useState("");

  let empowerCoinLongModal = 0;

  const assignMovedCoin = (e) => {
    const { value } = e.target;
    setCoinToMove(value);
    if (value > parseInt(availableCoin)) {
      setEmpowerCoinsError(`Value should be = or < ${availableCoin}`);
    } else {
      setEmpowerCoinsError("");
    }
  };

  const onClickIncreaseDecrease = (condition = "") => {
    if (parseInt(user?.account?.power) > 0) {
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
            if (prev >= 0 && empowerCoinLongModal >= parseInt(coinToMove)) {
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
    if (response?.status === 200) {
      let updatePost = [...allPost];
      let index = videoDetail?.index;
      updatePost[index]["empowered"] = videoDetail?.empowered + empowerCoin;
      updatePost[index]["power"] = response?.data?.data?.video?.power;
      if (parseInt(user?.account?.power) > 0) {
        dispatch(updateDetails({ power: user?.account?.power - empowerCoin }));
      }
      setAllPost(updatePost);
      setShowModal(false);
    }
  };

  return (
    <ReactModal isOpen={showModal} className="em-modal">
      <div className="em_modals">
        <div className="form-group cust_cls">
          <CoinMove
            onChangeInput={assignMovedCoin}
            moveCoinValue={coinToMove}
            availableCoin={availableCoin}
            empowerCoin={empowerCoin}
            onClickIncreaseDecrease={(value) => onClickIncreaseDecrease(value)}
            assignedCoinsError={empowerCoinsError}
            arrowClass="filter-invert"
          />
          <div className="form-group text-center">
            <button
              type="submit"
              className="btn-sub submit"
              onClick={handleEmpower}
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleCloseModal} className="close-button">
        Close
      </button>
    </ReactModal>
  );
};

export default AvailableCoinModal;
