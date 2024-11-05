import "./style.scss";

import { ReactComponent as Spent } from "assets/icons/likes-dark.svg";

const ProgressBar = ({
  bgcolor,
  coinsAssigned,
  coinsUsed,
  height,
  lineHeight,
  className = "",
  iconClassName = "",
}) => {
  return (
    <div
      style={{ height, lineHeight }}
      className={className ? className : "progress-parent"}
    >
      <div
        style={{
          width: `${(coinsUsed * 100) / coinsAssigned}%`,
          backgroundColor: bgcolor,
        }}
        className="child"
      >
        <span
          className={iconClassName ? `text ${iconClassName}` : " text spent"}
        >
          {" "}
          <Spent />
          {`${coinsUsed}/${coinsAssigned}`}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
