// assets
import { ReactComponent as PowerCoin } from "assets/icons/power-coin-dark.svg";
import arrow from "assets/images/arrow.png";

// styles
import styles from "./styles.module.scss";

// utils
import { formatNumberWithOneDecimal } from "common/utils";

const CoinMove = ({
  className,
  moveCoinValue = 1,
  onChangeInput = () => {},
  availableCoin = 20,
  onClickIncreaseDecrease = () => {},
  empowerCoin = 0,
  assignedCoinsError = "",
  arrowClass = "",
  contentClass,
}) => {
  return (
    <div className={`${styles.formgroup} ${styles.cust_cls} ${contentClass}`}>
      <div className={styles.empower}>
        <div className={styles.total_coins}>
          <label>Available Coins</label>
          <h3 className={contentClass ? contentClass : ""}>
            <em>
              <PowerCoin
                className={
                  className
                    ? `${className} ${styles.power_icon}`
                    : styles.power_icon
                }
              />
            </em>
            {formatNumberWithOneDecimal(availableCoin || 0)}
          </h3>
        </div>
        <div className={styles.formgroup}>
          <span onClick={() => onClickIncreaseDecrease("available")}>
            <img src={arrow} alt="" className={arrowClass} />
          </span>
          <br />
          <span onClick={() => onClickIncreaseDecrease()}>
            <img
              src={arrow}
              className={`${styles.bottom} ${arrowClass}`}
              alt=""
            />
          </span>
        </div>
        <div
          className={`${styles.total_coins} ${styles.right_imgs} ${contentClass}`}
        >
          <label>Empower Coins</label>
          <h3 className={contentClass ? contentClass : ""}>
            <em>
              <PowerCoin
                className={
                  className
                    ? `${className} ${styles.power_icon}`
                    : styles.power_icon
                }
              />
            </em>
            {empowerCoin}
          </h3>
        </div>
      </div>

      <div className={`${styles.flex_column} ${styles.class_coininput}`}>
        <label className={contentClass ? contentClass : ""}>
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
