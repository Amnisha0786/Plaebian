// custom components
import TitleIcon from "components/TitleIcon";

// assets
import { ReactComponent as Bag } from "assets/icons/earn.svg";
import { ReactComponent as Profile } from "assets/icons/profile-dark.svg";

// utils
import { getTitle } from "common/utils";

const UserDetailCard = ({
  image = "",
  firstName = "",
  usersCount = 0,
  power = 0,
  followerCount = "",
  onClickProfile = () => { },
}) => {
  const title = getTitle(followerCount);
  return (
    <div className="home_profile cursor-point" onClick={onClickProfile}>
      <div className="home-img-text w-100">
        <div className="home-img">
          <img src={image} alt="" className="power-icon" />
        </div>
        <div className="home-head location-profile clsHomeHead">
          <div className="covers cursor-point">
            <div className="content_botom">
              <TitleIcon title={title} />
              <h2>{firstName}</h2>
            </div>
            <div className="content_botom">
              {/* <TitleIcon title={title} /> */}
              <span>{title}</span>
            </div>
          </div>
          <div className="covers endscover">
            <div className="content_botom">
              <Profile />
              <span>{usersCount} </span>
            </div>
            <div className="content_botom">
              <Bag />
              <span>{power} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailCard;
