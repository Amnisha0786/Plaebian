// assets
import { ReactComponent as Bag } from "assets/icons/earn.svg";
import { ReactComponent as Profile } from "assets/icons/profile-dark.svg";

// utils
import { formatNumberWithOneDecimal } from "common/utils";

//styles
import styles from "../../pages/Locations/styles.module.scss";

const UserDetailCard = ({
  image = "",
  firstName = "",
  usersCount = 0,
  power = 0,
  onClickProfile = () => {},
  userDetail,
}) => {
  return (
    <div
      className={`${styles.home_profile} ${styles.cursor_point}`}
      onClick={onClickProfile}
    >
      <div className={`${styles.home_img_text} ${styles.w_100}`}>
        <div className={styles.home_img}>
          <img src={image} alt="" className={styles.power_icon} />
        </div>
        <div className={`${styles.home_head} ${styles.clsHomeHead}`}>
          <div className={`${styles.covers} ${styles.cursor_point}`}>
            <div className={styles.content_botom}>
              <h2>{firstName}</h2>
            </div>
            <div className={styles.content_botom}>
              <span>
                {userDetail?.city
                  ? `${
                      userDetail?.city?.name.charAt(0).toUpperCase() +
                      userDetail?.city?.name.slice(1)
                    }`
                  : null}
              </span>
            </div>
          </div>
          <div className={`${styles.covers} ${styles.endscover}`}>
            <div className={styles.content_botom}>
              <Profile />
              <span>{usersCount} </span>
            </div>
            <div className={styles.content_botom}>
              <Bag />
              <span>{formatNumberWithOneDecimal(power)} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailCard;
