import styles from "./styles.module.scss";

import { ReactComponent as Spent } from "assets/icons/likes-dark.svg";

const ProgressBar = ({
  bgcolor,
  coinsAssigned,
  coinsUsed,
  height,
  lineHeight,
  className = "",
  iconClassName = "",
  svgClassName = "",
}) => {
  return (
    <div
      style={{ height, lineHeight }}
      className={className ? className : `${styles.progress_parent}`}
    >
      <div
        style={{
          width: `${(coinsUsed * 100) / coinsAssigned}%`,
          // backgroundColor: bgcolor,
          height,
        }}
        className={styles.child}
      >
        <span
          className={
            iconClassName
              ? `${styles.text} ${iconClassName}`
              : `${styles.text} ${styles.spent}`
          }
        >
          {" "}
          <Spent className={svgClassName} />
          {`${coinsUsed}/${coinsAssigned}`}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
