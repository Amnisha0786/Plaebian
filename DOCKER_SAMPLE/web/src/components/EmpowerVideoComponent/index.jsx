// libraries
import { toast } from "react-toastify";

// hooks
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// components
import AddRemoveTrack from "../AddRemoveTrack";
import TitleIcon from "../TitleIcon";
import ProgressBar from "../ProgressBar";
import Video from "components/Video";

// assets
import { ReactComponent as PowersCoinLight } from "assets/icons/power-coin-light.svg";
import { ReactComponent as PowersCoinDark } from "assets/icons/power-coin-dark.svg";
import { ReactComponent as Comments } from "assets/icons/chat.svg";

// config
import { IMAGE_URL } from "../../config";

//styles
import "./styles.scss";

const EmpowerVideoComponent = ({
  post,
  index,
  setAllPost,
  title,
  allPost,
  handleFullWatch,
  onClickEmpower,
  handleOnMouseDown,
  handleOnTouchStart,
  handleOnMouseUp,
  openModalComment,
  isLongPress,
  openModal,
  handleOnTouchEnd,
}) => {
  const user = useSelector((state) => state.user?.value);
  const navigate = useNavigate();

  const isLoggedIn = user?.token;

  const userNotLogin = () => {
    navigate("/login");
    return toast("You have to login to see other's profile");
  };

  const onClickProfile = (userId) => {
    if (!user?.token) {
      userNotLogin();
      return;
    }
    navigate(`/userProfile/${userId}`);
  };

  function handleOnClick(callback) {
    if (isLongPress.current) {
      return;
    }
    callback();
  }

  return (
    <div className="full" key={index}>
      <ProgressBar
        bgcolor="orange"
        coinsUsed={post?.powerTransferred}
        coinsAssigned={post?.power}
        height={30}
        lineHeight="40px"
        iconClassName={"bar-icons"}
      />
      <div className="home_profile">
        <div
          className="home-img-text cursor-point"
          onClick={() => onClickProfile(post?.account?.id)}
        >
          <div className="home-img">
            <img
              src={IMAGE_URL + post?.account.pfp || ""}
              alt=""
              className="power-icon"
              width="60px"
              height="60px"
            />
            {isLoggedIn && (
              <AddRemoveTrack
                data={post}
                allData={allPost}
                index={index}
                setData={setAllPost}
              />
            )}
          </div>
          <div className="home-head">
            <h2 onClick={() => onClickProfile(post?.account?.id)}>
              {post.account.firstName + " " + post.account.lastName}
            </h2>
            <div className="content_botom">
              <TitleIcon title={title} />
              <span>{title} </span>
            </div>
          </div>
        </div>
        <div className="home-right">
          <p className="power_p">
            Earn 1 <PowersCoinDark className="power-icon" />
            By Watching This Video
          </p>
        </div>
      </div>

      <div className="full-img">
        <Video
          src={post?.url}
          isShowControls
          autoPlay
          poster={post?.thumbnail}
          onEnded={() => handleFullWatch(post, index)}
          height={300}
          width={400}
        />
        <p className="power_p">{post.location}</p>
      </div>
      <div className="ul_div comments_ul">
        <ul>
          <li
            onClick={() =>
              handleOnClick(() => {
                onClickEmpower(post, index);
              })
            }
            onMouseDown={() => handleOnMouseDown(openModal, post, index)}
            onMouseUp={handleOnMouseUp}
            onTouchStart={() => handleOnTouchStart(openModal, post, index)}
            onTouchEnd={handleOnTouchEnd}
          >
            {" "}
            {post.empowered ? <PowersCoinDark /> : <PowersCoinLight />}
            <span>EMPOWER{`(${post.empowered})`}</span>
          </li>

          <li onClick={() => openModalComment(post, index)}>
            <Comments />
            <span>
              COMMENTS {user?.token ? `(${post?.commentCount || 0})` : ""}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EmpowerVideoComponent;
