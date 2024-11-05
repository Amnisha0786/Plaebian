import React from "react";

// library components
import InfiniteScroll from "react-infinite-scroll-component";

// hooks
import { useNavigate } from "react-router-dom";

// assets
import empowerIcon from "assets/icons/empowerers-a.png";

// config
import { IMAGE_URL } from "config";

// styles
import styles from "./styles.module.scss";

const SpecialEmpowerVideo = ({ totalLikesCount, allLikedVideos }) => {
  const navigate = useNavigate();

  return (
    <>
      <InfiniteScroll
        dataLength={allLikedVideos?.length}
        next={allLikedVideos}
        scrollableTarget="scroll-container"
        hasMore={allLikedVideos?.length !== totalLikesCount}
      >
        <div className={styles.videos}>
          {allLikedVideos?.map((video, index) => (
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

export default SpecialEmpowerVideo;
