// Custom Components
import TitleIcon from "../../TitleIcon";
import AddRemoveTrack from "../../AddRemoveTrack";

// icons
import { ReactComponent as ProfileDark } from "assets/icons/empowerers-dark.svg";
import { ReactComponent as ProfileLight } from "assets/icons/empowerers-dark.svg";
import { ReactComponent as EarnLight } from "assets/icons/earn.svg";

// config
import { IMAGE_URL } from "config";

// styles
import "./styles.scss";

const ProfileSection = ({
  profile,
  onFollow = () => { },
  setUserProfile = () => { },
  isUser = false,
}) => {

  return (
    <>
      <div className="profile_section">
        <div className="pro_img">
          <img src={`${IMAGE_URL}${profile?.account?.pfp}`} alt="pro" />
          {isUser && (
            <AddRemoveTrack
              data={profile}
              isProfile={true}
              setData={setUserProfile}
            />
          )}
        </div>
        <div className="pro_content">
          {/* <h3>{`${profile?.account?.firstName} ${profile?.account?.lastName}`}</h3> */}
          <div className="pro_sides">
            <div className="content_botom">
              <TitleIcon title={profile?.title} className="profile-svg" />
              {/* <span>{profile?.title} </span> */}
              <span>{`${profile?.account?.firstName} ${profile?.account?.lastName}`}</span>
            </div>
            <div className="content_botom width_40">
              <EarnLight className="profile-svg" />
              <span>{parseInt(profile?.account?.power)} </span>
            </div>
            <div className="content_botom width_60">
              <span>
                {`${profile?.city?.name || ""}, ${profile?.state?.name || ""}`}
              </span>
            </div>
            <div
              className={
                profile?.youFollowing
                  ? "is_follow content_botom"
                  : "content_botom"
              }
              onClick={() => onFollow()}
            >
              {profile?.youFollowing ? <ProfileDark className="profile-svg" /> : <ProfileLight className="profile-svg" />}
              <span>{profile?.account?.followerCount} </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSection;
