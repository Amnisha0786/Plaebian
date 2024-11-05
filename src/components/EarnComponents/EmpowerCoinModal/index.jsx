// custom components
import CoinMove from "../../CoinMove";
import Modal from "components/Modal/common/Modal";

//styles
import styles from "components/CommentList/styles.module.scss";

const EmpowerCoinModal = ({
  availableCoin,
  coinToMove,
  empowerCoin,
  onClickIncreaseDecrease = () => {},
  succesCallback = () => {},
  setCoinToMove = () => {},
  setEmpowerCoinsError = () => {},
  empowerCoinsError = "",
  showModal = false,
  handleEmpower = () => {},
  isLoading = false,
  handleCloseModal = () => {},
  postDetail = {},
}) => {
  const assignMovedCoin = (e) => {
    const { value } = e.target;
    setCoinToMove(value);
    if (value > parseInt(availableCoin)) {
      setEmpowerCoinsError(`Value should be = or < ${availableCoin}`);
    } else {
      setEmpowerCoinsError("");
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
            arrowClass={styles.filter_invert}
            contentClass={styles.modal_content}
            onChangeInput={assignMovedCoin}
            moveCoinValue={coinToMove}
            availableCoin={availableCoin}
            empowerCoin={empowerCoin}
            onClickIncreaseDecrease={(value) => onClickIncreaseDecrease(value)}
            assignedCoinsError={empowerCoinsError}
          />
          <div className={`${styles.form_group} ${styles.text_center}`}>
            <button
              type="submit"
              className={`${styles.btn_sub} ${styles.submit}`}
              onClick={() =>
                handleEmpower(postDetail, empowerCoin, succesCallback)
              }
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

export default EmpowerCoinModal;
