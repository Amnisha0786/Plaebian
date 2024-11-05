// custom components
import TitleIcon from "../TitleIcon";

// config
import { IMAGE_URL } from "config";

import { ReactComponent as Bag } from "assets/icons/earn.svg";
import { ReactComponent as Profile } from "assets/icons/profile-dark.svg";
import { ReactComponent as ProfileDark } from "assets/icons/empowerers-dark.svg";

const UserListCard = ({
  id = "",
  title = "",
  name = "",
  image = "",
  power,
  followerCount,
  onClickProfile = () => {},
}) => {
  return (
    <div
      className="home_profile cursor-point"
      key={id}
      onClick={() => onClickProfile(id)}
    >
      <div className="home-img-text">
        <div className="home-img">
          <img src={IMAGE_URL + image} alt={name} className="power-icon" />
        </div>
        <div className="home-head">
          <div className="d-flex flex2">
            <div className="content_botom">
              <h2 className="border-bottom-none margin-0">{name}</h2>
            </div>
            <div className="content_botom end">
              <ProfileDark className="profile-svg" />
              <span>{followerCount} </span>
            </div>
          </div>
          <div className="d-flex flex2">
            <div className="content_botom">
              <TitleIcon title={title} />
              <span>{title} </span>
            </div>
            <div className="content_botom end">
              <Bag />
              <span>{parseInt(power)} </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserListCard;
