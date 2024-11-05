// assets
import { ReactComponent as PowerCoin } from "assets/icons/power-coin-dark.svg";
import arrow from "assets/images/arrow.png";

// styles
import "../../pages/Add/styles.scss";

const CoinMove = ({
  moveCoinValue = 1,
  onChangeInput = () => {},
  availableCoin = 20,
  onClickIncreaseDecrease = () => {},
  empowerCoin = 0,
  assignedCoinsError = "",
  arrowClass = "",
}) => {
  return (
    <div className="form-group cust_cls">
      <div className="empower">
        <div className="total_coins">
          <label>Available Coins</label>
          <h3>
            <em>
              <PowerCoin className="power-icon" />
            </em>
            {parseInt(availableCoin || 0)}
          </h3>
        </div>
        <div className="form-group">
          <span onClick={() => onClickIncreaseDecrease("available")}>
            <img src={arrow} alt="" className={arrowClass} />
          </span>
          <br />
          <span onClick={() => onClickIncreaseDecrease()}>
            <img src={arrow} className={`bottom ${arrowClass}`} alt="" />
          </span>
        </div>
        <div className="total_coins right_imgs">
          <label>Empower Coins</label>
          <h3>
            <em>
              <PowerCoin className="power-icon" />
            </em>
            {empowerCoin}
          </h3>
        </div>
      </div>
      <div className="flex-column class_coininput">
        <label>
          Coin to move
          <input
            type="number"
            placeholder="Coin"
            name="assignedCoins"
            value={moveCoinValue}
            onChange={onChangeInput}
          />
        </label>
        {assignedCoinsError && (
          <span className="error-mesage">{assignedCoinsError}</span>
        )}
      </div>
    </div>
  );
};

export default CoinMove;
