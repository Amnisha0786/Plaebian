// library components
import ReactModal from "react-modal";

// custom components
import CoinMove from "../../CoinMove";

const EmpowerCoinModal = ({
  availableCoin,
  coinToMove,
  empowerCoin,
  onClickIncreaseDecrease = () => { },
  succesCallback = () => { },
  setCoinToMove = () => { },
  setEmpowerCoinsError = () => { },
  empowerCoinsError = "",
  showModal = false,
  handleEmpower = () => { },
  isLoading = false,
  handleCloseModal = () => { },
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
          />
          <div className="form-group text-center">
            <button
              type="submit"
              className="btn-sub submit"
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

      <button onClick={handleCloseModal} className="close-button">
        Close
      </button>
    </ReactModal>
  );
};

export default EmpowerCoinModal;
