import React from "react";

// library components
import InfiniteScroll from "react-infinite-scroll-component";

// hooks
import { useNavigate } from "react-router-dom";

// assets
import empowerIcon from "assets/icons/empowerers-a.png";

// styles
import styles from "./styles.module.scss";

// config
import { IMAGE_URL } from "config";

const LikesList = ({
  likeVideos,
  totalLikesCount = 0,
  getLikesData = () => {},
}) => {
  const navigate = useNavigate();
  return (
    <>
      <InfiniteScroll
        dataLength={likeVideos.length}
        next={getLikesData}
        scrollableTarget="scroll-container"
        hasMore={likeVideos.length !== totalLikesCount}
      >
        <div className={styles.videos}>
          {likeVideos.map((video, index) => (
            <div className={styles.video_box} key={index}>
              <div
                className={styles.vid}
                onClick={() => navigate(`/videoDetail/${video.videoId}`)}
              >
                {video.thumbnail ? (
                  <img src={IMAGE_URL + video.thumbnail} alt="thumbnail" />
                ) : (
                  "Video"
                )}
              </div>
              <div className={`${styles.img_text_video} ${styles.bgColor}`}>
                <img src={empowerIcon} alt="" />
                <span>{video?.powerTransferred}</span>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
};

export default LikesList;
