import React, { useState } from "react";

// library components
import ReactModal from "react-modal";
import InfiniteScroll from "react-infinite-scroll-component";

// custom components
import Video from "components/Video";

// hooks
import { useNavigate } from "react-router-dom";

// assets
import empowerIcon from "assets/icons/empowerers-a.png";

// styles
import "./styles.scss";

// config
import { IMAGE_URL } from "config";

const LikesList = ({
  likeVideos,
  handleFullWatch = () => { },
  totalLikesCount = 0,
  getLikesData = () => { },
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({});
  const navigate = useNavigate();

  const openModal = (video) => {
    setShowModal(true);
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVideo({});
  };
  return (
    <>
      <InfiniteScroll
        dataLength={likeVideos.length}
        next={getLikesData}
        scrollableTarget="scroll-container"
        hasMore={likeVideos.length !== totalLikesCount}
      >
        <div className="videos">
          {likeVideos.map((video, index) => (
            <div className="video_box" key={index}>
              <div
                className="vid"
                onClick={() => navigate(`/videoDetail/${video.videoId}`)}
              >
                {video.thumbnail ? (
                  <img src={IMAGE_URL + video.thumbnail} alt="thumbnail" />
                ) : (
                  "Video"
                )}
              </div>
              <div className="img_text-video bgColor">
                <img src={empowerIcon} alt="" />
                <span>{video?.powerTranferred}</span>
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>

      <ReactModal isOpen={showModal}>
        <Video
          src={selectedVideo?.url}
          poster={selectedVideo?.thumbnail}
          onEnded={() => {
            handleFullWatch(selectedVideo, true);
          }}
          autoPlay
          controls
          width="300"
          height="200"
        />

        <button onClick={handleCloseModal} className="close-button">
          Close Modal
        </button>
      </ReactModal>
    </>
  );
};

export default LikesList;
