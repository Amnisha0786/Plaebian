// libraries
import { toast } from "react-toastify";

// hooks
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// components
import AddRemoveTrack from "../AddRemoveTrack";
import ProgressBar from "../ProgressBar";
import Video from "components/Video";

// assets
import { ReactComponent as PowersCoinLight } from "assets/icons/power-coin-light.svg";
import { ReactComponent as PowersCoinDark } from "assets/icons/power-coin-dark.svg";
import { ReactComponent as CommentsDark } from "assets/icons/chat.svg";
import { ReactComponent as CommentsLight } from "assets/icons/chatlight.svg";
import { ReactComponent as SpecialCoinIconDark } from "assets/icons/Location_4_Gladiator_A.svg";
import { ReactComponent as SpecialCoinIconLight } from "assets/icons/locations-light.svg";

// config
import { IMAGE_URL } from "../../config";

//styles
import styles from "./styles.module.scss";

const EmpowerVideoComponent = ({
  post,
  index,
  setAllPost,
  title,
  allPost,
  handleFullWatch,
  onClickEmpower,
  onClickSpecialEmpower,
  handleOnMouseDown,
  handleOnTouchStart,
  handleOnMouseUp,
  openModalComment,
  isLongPress,
  openModal,
  handleOnTouchEnd,
  openSpecialModal,
  isEmpowerOne,
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
    <div className={styles.full} key={index}>
      <ProgressBar
        bgcolor="orange"
        coinsUsed={post?.powerTransferred}
        coinsAssigned={post?.power}
        height={30}
        lineHeight="40px"
        className={`${styles.progress_parent} ${styles.bar}`}
        iconClassName={styles.bar_icons}
      />
      <div className={styles.home_profile}>
        <div
          className={`${styles.home_img_text} ${styles.cursor_point}`}
          onClick={() => onClickProfile(post?.account?.id)}
        >
          <div className={styles.home_img}>
            <img
              src={IMAGE_URL + post.account.pfp}
              alt=""
              className={styles.power_icon}
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
          <div className={styles.home_head}>
            <h2 onClick={() => onClickProfile(post?.account?.id)}>
              {post.account.firstName + " " + post.account.lastName}
            </h2>
            <div className={styles.content_botom}>
              <span>{title} </span>
            </div>
          </div>
        </div>
        <div className={styles.home_right}>
          <p className={styles.power_p}>
            Earn 1 <PowersCoinDark className={styles.power_icon} />
            By Watching This Video
          </p>
        </div>
      </div>

      <div className={styles.full_img}>
        <Video
          src={post?.url}
          isShowControls
          autoPlay
          poster={post?.thumbnail}
          onEnded={() => handleFullWatch(post, index)}
          height={300}
          width={400}
        />
        <p className={styles.power_p}>{post.location}</p>
      </div>
      <div className={`${styles.ul_div} ${styles.comments_ul}`}>
        <ul>
          {isEmpowerOne && (
            <li
              onClick={() =>
                handleOnClick(() => {
                  onClickSpecialEmpower(post, index);
                })
              }
              onMouseDown={() =>
                handleOnMouseDown(openSpecialModal, post, index)
              }
              onMouseUp={handleOnMouseUp}
              onTouchStart={() =>
                handleOnTouchStart(openSpecialModal, post, index)
              }
              onTouchEnd={handleOnTouchEnd}
            >
              {" "}
              {post?.specialEmpowered ? (
                <SpecialCoinIconDark />
              ) : (
                <SpecialCoinIconLight />
              )}
              <span>VIP{`(${post?.specialEmpowered})`}</span>
            </li>
          )}

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
            {post?.commentDetails && post?.commentDetails?.length !== 0 ? (
              <CommentsDark />
            ) : (
              <CommentsLight />
            )}
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
