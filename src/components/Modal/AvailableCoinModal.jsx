// custom components
import CoinMove from "../CoinMove";
import Modal from "./common/Modal";

// utils
import { toast } from "react-toastify";

//styles
import styles from "./styles.module.scss";

const AvailableCoinModal = ({
  showModal = false,
  setCoinToMove,
  isLoading,
  handleCloseModal,
  coinToMove,
  handleEmpower,
  empowerCoinsError,
  setEmpowerCoinsError,
  empowerCoin,
  setEmpowerCoin,
  availableCoin,
  setAvailableCoin,
}) => {
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
        if (coinToMove >= 1) {
          setAvailableCoin((prev) => {
            if (prev >= 0 && empowerCoinLongModal !== parseInt(empowerCoin)) {
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

  return (
    <Modal
      isOpen={showModal}
      handleCloseModal={handleCloseModal}
      closeButtonClass={styles.lightClose_button}
      modalClass={styles.em_modal}
      text={"Close"}
    >
      <div className={styles.em_modals}>
        <div className={`${styles.form_group} ${styles.cust_cls}`}>
          <CoinMove
            className={styles.modal_power_icon}
            contentClass={styles.modal_content}
            onChangeInput={assignMovedCoin}
            moveCoinValue={coinToMove}
            availableCoin={availableCoin}
            empowerCoin={empowerCoin}
            onClickIncreaseDecrease={(value) => onClickIncreaseDecrease(value)}
            assignedCoinsError={empowerCoinsError}
            arrowClass={styles.filter_invert}
          />
          <div className={`${styles.form_group} ${styles.text_center}`}>
            <button
              type="submit"
              className={`submit ${styles.btn_sub} ${styles.submit}`}
              onClick={handleEmpower}
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* <button onClick={handleCloseModal} className={styles.close_button}>
        Close
      </button> */}
    </Modal>
  );
};

export default AvailableCoinModal;
