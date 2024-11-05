import React, { useState } from "react";

// custom components
import LoaderSpiner from "components/Loader";
import ProgressBar from "components/ProgressBar";
import DeleteVideoModal from "pages/VideoDetail/DeleteVideoModal/DeleteVideoModal";
import VideoThumbnail from "components/Thumbnail/VideoThumbnail";

// hooks
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// icons
import { ReactComponent as DeleteIcon } from "assets/icons/trash-can-regular.svg";
// styles
import styles from "./styles.module.scss";

const VideoList = ({ videos, usersVideo, removeVideo = () => {} }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteVideoId, setDeleteVideoId] = useState(null);
  const isLoading = useSelector((state) => state.loader.isLoading);

  const navigate = useNavigate();

  const handleDeleteClick = (e, videoId) => {
    e.stopPropagation();
    setDeleteVideoId(videoId);
    setShowDeleteModal(true);
  };

  const onDeleteSuccess = () => {
    removeVideo(deleteVideoId);
    setDeleteVideoId(null);
  };

  const handleDeleteClose = () => setShowDeleteModal(false);

  return (
    <>
      {isLoading && <LoaderSpiner />}
      <div className={styles.videos}>
        {videos.map((video, index) => (
          <div className={styles.video_box} key={index}>
            <div
              className={`${styles.vid} ${styles.relative} `}
              onClick={() => navigate(`/videoDetail/${video.id}`)}
            >
              {usersVideo && (
                <button
                  className={styles.delete_video_icon}
                  onClick={(e) => handleDeleteClick(e, video.id)}
                >
                  <DeleteIcon />
                </button>
              )}
              <VideoThumbnail
                thumbnail={video?.thumbnail}
                timer={
                  video?.totalPowerTransferredDate != null &&
                  video?.totalPowerTransferredDate
                }
                video={video}
                removeVideo={removeVideo}
              />
            </div>
            <ProgressBar
              bgcolor="orange"
              coinsAssigned={video?.power}
              coinsUsed={video?.powerTransferred}
              height={28}
              lineHeight="0px"
            />
          </div>
        ))}
      </div>
      <DeleteVideoModal
        handleClose={handleDeleteClose}
        onSuccess={onDeleteSuccess}
        id={deleteVideoId}
        isOpen={showDeleteModal}
      />
    </>
  );
};

export default VideoList;
