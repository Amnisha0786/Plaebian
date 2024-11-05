import { useEffect, useState } from "react";

// config
import { IMAGE_URL } from "config";

// styles
import styles from "./styles.module.scss";

// icons
import { ReactComponent as InfoIcon } from "assets/icons/info.svg";

// library utils
import { toast } from "react-toastify";

// api
import { API_END_POINTS } from "common/apiConstants";
import { deleteRequest } from "helper/api";

// hooks
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

// redux
import { logout } from "redux/sharedSlices/user";

function VideoThumbnail({ thumbnail, timer, video, removeVideo }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let utcFormat = new Date(timer).toUTCString();

  let locdate = new Date(utcFormat);

  const targetTimestampLocal = new Date(
    locdate.getTime() + 24 * 60 * 60 * 1000
  );

  const [remainingTime, setRemainingTime] = useState(
    targetTimestampLocal - new Date()
  );

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const currentTime = new Date();
      const newRemainingTime = targetTimestampLocal - currentTime;
      if (newRemainingTime <= 0) {
        clearInterval(timerInterval);
        setRemainingTime(0);
      } else {
        setRemainingTime(newRemainingTime);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [targetTimestampLocal]);

  const hours = Math.floor(remainingTime / 3600000);
  const minutes = Math.floor((remainingTime % 3600000) / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);

  const handleDelete = async () => {
    try {
      const response = await deleteRequest({
        API: `${API_END_POINTS.UPDATE_VIDEO}/${video.id}`,
      });

      if (response?.success) {
        removeVideo(video?.id);
        toast.success("Your Video is deleted ! !");
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast.error(response?.data?.message, "Something went wrong  !");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong !");
    }
  };

  useEffect(() => {
    if (timer && remainingTime === 0) {
      handleDelete();
    }
  }, [remainingTime, timer]);

  const onClickInfoIcon = (e) => {
    e.stopPropagation();
    toast.warn(
      `You have ${hours} hours, ${minutes} minutes, ${seconds} seconds left to give more coins to this video, otherwise it will be deleted`
    );
  };

  return (
    <>
      {thumbnail ? (
        <img src={IMAGE_URL + thumbnail} alt="thumbnail" />
      ) : (
        "Video"
      )}
      {timer && (
        <div className={styles.info}>
          <button className={styles.button} onClick={(e) => onClickInfoIcon(e)}>
            <InfoIcon />
          </button>
          <span className={styles.timer}>
            <span className={styles.span}>
              {hours}:{minutes}:{seconds}
            </span>
          </span>
        </div>
      )}
    </>
  );
}

export default VideoThumbnail;
