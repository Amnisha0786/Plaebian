import React, { useState } from "react";

// library components
import ReactModal from "react-modal";

// custom components
import LoaderSpiner from "components/Loader";
import Video from "components/Video";
import ProgressBar from "components/ProgressBar";

// hooks
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// styles
import "./styles.scss";

// config
import { IMAGE_URL } from "config";

const VideoList = ({ videos, handleFullWatch = () => {} }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState({});
  const isLoading = useSelector((state) => state.loader.isLoading);

  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/video/edit/${selectedVideo?.id}`);
  };

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
      {isLoading && <LoaderSpiner />}
      <div className="videos">
        {videos.map((video, index) => (
          <div className="video_box" key={index}>
            <div
              className="vid"
              onClick={() => navigate(`/videoDetail/${video.id}`)}
            >
              {video.thumbnail ? (
                <img src={IMAGE_URL + video.thumbnail} alt="thumbnail" />
              ) : (
                "Video"
              )}
            </div>
            <ProgressBar
              bgcolor="orange"
              coinsAssigned={video?.power}
              coinsUsed={video?.powerTransferred}
              height={20}
              lineHeight="0px"
            />
          </div>
        ))}
      </div>
      <ReactModal isOpen={showModal}>
        <Video
          src={selectedVideo?.url}
          poster={selectedVideo?.thumbnail}
          onEnded={() => handleFullWatch(selectedVideo, true)}
          controls
          autoPlay
          width="300"
          height="200"
        />
        <button onClick={handleEditClick} className="close-button right_spac">
          Edit
        </button>
        <button onClick={handleCloseModal} className="close-button">
          Close
        </button>
      </ReactModal>
    </>
  );
};

export default VideoList;
