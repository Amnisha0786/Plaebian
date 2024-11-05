// Custom Components
import AddRemoveTrack from "../../AddRemoveTrack";

// icons
import { ReactComponent as ProfileDark } from "assets/icons/empowerers-dark.svg";
import { ReactComponent as ProfileLight } from "assets/icons/empowerers-dark.svg";
import { ReactComponent as EarnLight } from "assets/icons/earn.svg";

// config
import { IMAGE_URL } from "config";

// styles
import styles from "./styles.module.scss";

//hooks
import { useSelector } from "react-redux";

// utils
import { formatNumberWithOneDecimal } from "common/utils";

const ProfileSection = ({
  profile,
  onFollow = () => {},
  setUserProfile = () => {},
  isUser = false,
}) => {

  const user = useSelector((state) => state.user.value);

  return (
    <>
      <div className={styles.profile_section}>
        <div className={styles.pro_img}>
          <img src={`${IMAGE_URL}${profile?.account?.pfp}`} alt="pro" className={styles.image_profile} />
          {isUser && (
            <AddRemoveTrack
              data={profile}
              isProfile={true}
              setData={setUserProfile}
            />
          )}
        </div>
        <div className={styles.pro_content}>
          {/* <h3>{`${profile?.account?.firstName} ${profile?.account?.lastName}`}</h3> */}
          <div className={styles.pro_sides}>
            <div className={styles.content_botom}>
              {/* width_60 */}
              {/* <TitleIcon
                title={profile?.title}
                className={styles.profile_svg}
              /> */}
              {/* <span>{profile?.title} </span> */}
              <span>{`${profile?.account?.firstName} ${profile?.account?.lastName}`}</span>
            </div>
            <div className={`${styles.content_botom} ${styles.width_40}`}>
              <EarnLight className={styles.profile_svg} />
              <span>
                {formatNumberWithOneDecimal(profile?.account?.power)}{" "}
              </span>
            </div>
            <div className={`${styles.content_botom} ${styles.width_60}`}>
              <span>
                {`${profile?.city?.name || ""}, ${profile?.state?.name || ""}`}
              </span>
            </div>
            <div
              className={
                profile?.youFollowing
                  ? `${styles.is_follow} ${styles.content_botom}`
                  : styles.content_botom
              }
              onClick={() => onFollow()}
            >
              {profile?.youFollowing ? (
                <ProfileDark className={styles.profile_svg} />
              ) : (
                <ProfileLight className={styles.profile_svg} />
              )}
              <span>{profile?.account?.followerCount} </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSection;
