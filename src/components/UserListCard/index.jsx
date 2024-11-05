// config
import { IMAGE_URL } from "config";

import { ReactComponent as Bag } from "assets/icons/earn.svg";
import { ReactComponent as ProfileDark } from "assets/icons/empowerers-dark.svg";

// styles
import styles from "./styles.module.scss";

// utils
import { formatNumberWithOneDecimal } from "common/utils";

const UserListCard = ({
  id = "",
  title = "",
  name = "",
  image = "",
  power,
  followerCount,
  onClickProfile = () => {},
  userDetail,
}) => {
  return (
    <div
      className={`${styles.home_profile} ${styles.cursor_point}`}
      key={id}
      onClick={() => onClickProfile(id)}
    >
      <div className={styles.home_img_text}>
        <div className={styles.home_img}>
          <img
            src={IMAGE_URL + image}
            alt={name}
            className={styles.power_icon}
          />
        </div>
        <div className={styles.home_head}>
          <div className={styles.d_flex}>
            <div className={styles.content_botom}>
              <h2 className={`${styles.border_bottom_none} ${styles.margin_0}`}>
                {name}
              </h2>
            </div>
            <div className={`${styles.content_botom} ${styles.end}`}>
              <ProfileDark className={styles.profile_svg} />
              <span>{followerCount} </span>
            </div>
          </div>
          <div className={styles.d_flex}>
            <div className={`${styles.content_botom} ${styles.address}`}>
              <span>
                {`${
                  userDetail?.city?.name.charAt(0).toUpperCase() +
                  userDetail?.city?.name.slice(1)
                }, ${
                  userDetail?.state?.name.charAt(0).toUpperCase() +
                  userDetail?.state?.name.slice(1)
                }`}
              </span>
            </div>
            <div className={`${styles.content_botom} ${styles.end}`}>
              <Bag />
              <span>{formatNumberWithOneDecimal(power)} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserListCard;
