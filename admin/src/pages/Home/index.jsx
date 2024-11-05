import React, { useEffect, useState } from "react";

// library hooks
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

// api
import { API_URLS } from "src/api/apiConstants";
import { deleteRequest, getRequest, putRequest } from "src/api/axios";

// redux
import { startLoading, stopLoading } from "src/redux/sharedSlices/loader";

// custom components
import LoaderSpiner from "src/components/Loader";
import ConfirmModal from "src/components/ConfirmModal";
import Header from "../../components/Header";

// assets
import { ReactComponent as DeleteIcon } from "../../assets/trash-can-regular.svg";
import { ReactComponent as EditIcon } from "../../assets/edit.svg";
import close from "../../assets/close.png";

// styles
import "./styles.scss";
import Video from "src/components/Video";
import { logout } from "src/redux/sharedSlices/user";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [modalIsOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHideVideoConfirm, setShowHideVideoConfirm] = useState(false);
  const [showVideoToUserConfirm, setShowVideoToUserConfirm] = useState(false);
  const [videoList, setVideoList] = useState([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState({});

  const isLoading = useSelector((state) => state.loader.isLoading);

  useEffect(() => {
    getVideo();
  }, []);

  async function getVideo() {
    try {
      dispatch(startLoading());
      const response = await getRequest({ API: API_URLS.GET_TUTORIALS });
      if (response?.data?.videos?.length) {
        setVideoList(response?.data.videos);
        setTotalVideos(response?.data.totalCount || 0);
      } else if ( response?.status === 401 ){
        navigate("/login");
        dispatch(logout())
      }
    } catch (error) {
      toast(error?.data?.message || "Something went wrong", {
        type: "error",
      });
    }finally {
      dispatch(stopLoading());
    }
  }

  const updateVideo = async (body, successMessage = "", cb) => {
    try {
      dispatch(startLoading());
      const response = await putRequest({
        API: `${API_URLS.UPDATE_TUTORIAL}/${selectedVideo.id}`,
        DATA: body,
      });
      if (response?.success) {
        const currentTutorials = [...videoList];
        const newTutorials = currentTutorials.map((tutorial) => {
          if (tutorial?.id === selectedVideo.id) {
            return response.data.video;
          }
          return tutorial;
        });
        setVideoList(newTutorials);
        setSelectedVideo({});
        cb();
        toast(successMessage, {
          type: "success",
        });
      }else if( response?.data.status === 401 ){
        navigate("/login");
        dispatch(logout())
      }
    } catch (error) {
      toast(error?.data?.message || "Something went wrong", {
        type: "error",
      });
      dispatch(stopLoading());
    }finally {
      dispatch(stopLoading());
    }
  };

  const handleDeleteVideo = async () => {
    try {
      dispatch(startLoading());
      const response = await deleteRequest({
        API: `${API_URLS.UPDATE_TUTORIAL}/${selectedVideo.id}`,
      });
      if (response?.status === 200) {
        const currentTutorials = [...videoList];
        const newTutorials = currentTutorials.filter((tutorial) => {
          return tutorial?.id !== selectedVideo.id;
        });
        setVideoList(newTutorials);
        setSelectedVideo({});
        hideDeleteConfirm();
        toast("Tutorial deleted successfully.", {
          type: "success",
        });
      } else if( response?.status === 401 ){
        navigate("/login");
        dispatch(logout())
      }
    } catch (error) {
      toast(error?.data?.message || "Something went wrong", {
        type: "error",
      });
      dispatch(stopLoading());
    } finally {
      dispatch(stopLoading());
    }
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const hideDeleteConfirm = () => setShowDeleteConfirm(false);
  const closeHideVideoConfirm = () => setShowHideVideoConfirm(false);
  const closeShowToUserConfirm = () => setShowVideoToUserConfirm(false);

  const handleHideVideo = () => {
    updateVideo(
      {
        ...selectedVideo,
        showToUser: false,
      },
      "Video is now hidden from the users",
      closeHideVideoConfirm
    );
  };

  const handlVideoShowToUsers = () => {
    updateVideo(
      {
        ...selectedVideo,
        showToUser: true,
      },
      "Video is now visible to the users",
      closeShowToUserConfirm
    );
  };

  const handleEditChange = ({ target: { name, value } }) => {
    setSelectedVideo({
      ...selectedVideo,
      [name]: value,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateVideo(selectedVideo, "Video updated Successfullly.", closeModal);
  };

  const cancelEditVideo = () => {
    setSelectedVideo({});
    closeModal();
  };

  const customStyles = {
    content: {
      height: "300px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      maxWidth: "70%",
      margin: "0 auto",
    },
  };

  return (
    <div>
      <Header />
      {isLoading && <LoaderSpiner />}
      <div className="admin_wraper">
        <div className="videoList">
          <div className="listMainBox">
            {videoList?.map((video) => {
              return (
                <div className="boxeslist" key={video?.id}>
                  <div className="video-img">
                    <Video src={video.url} width="320" height="240"  controls />
                  </div>
                  <div className="video-text">
                    <h4>{video?.title}</h4>
                    <p>{video?.description}</p>
                    <div className="videoButtons">
                      {!video?.showToUser ? (
                        <button
                          className="common_btn"
                          onClick={() => {
                            setSelectedVideo(video);
                            setShowVideoToUserConfirm(true);
                          }}
                        >
                          Show to User
                        </button>
                      ) : (
                        <button
                          className="common_btn hide_btn"
                          onClick={() => {
                            setSelectedVideo(video);
                            setShowHideVideoConfirm(true);
                          }}
                        >
                          Hide from User
                        </button>
                      )}
                      <button
                        className="common_btn delete"
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setSelectedVideo(video);
                        }}
                      >
                        <DeleteIcon />
                      </button>
                      <button
                        className="common_btn delete"
                        onClick={() => {
                          openModal();
                          setSelectedVideo(video);
                        }}
                      >
                        <EditIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="admin_wraper">
          <div className="add-form">
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              style={customStyles}
            >
              {/* <button className="close" onClick={closeModal}>
                <img src={close} />
              </button> */}

              <form className="formAddVideo" onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Title"
                    name="title"
                    value={selectedVideo.title}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="4"
                    cols="50"
                    value={selectedVideo.description}
                    name="description"
                    onChange={handleEditChange}
                  ></textarea>
                </div>
                <button
                  className="common_btn canalBtn me-4"
                  onClick={cancelEditVideo}
                >
                  Cancel
                </button>
                <button className="common_btn" type="submit">
                  Submit
                </button>

                <button className="close-button" onClick={closeModal}>
                  Close Modal
                </button>
              </form>
            </Modal>
          </div>
        </div>
        <ConfirmModal
          showModal={showDeleteConfirm}
          handleConfirm={handleDeleteVideo}
          handleCancel={hideDeleteConfirm}
          message="Are you sure to delete the video?"
          confirmLabel="Delete"
        />
        <ConfirmModal
          showModal={showHideVideoConfirm}
          handleConfirm={handleHideVideo}
          handleCancel={closeHideVideoConfirm}
          message="Are you sure to hide this video from users?"
          confirmLabel="Hide"
        />
        <ConfirmModal
          showModal={showVideoToUserConfirm}
          handleConfirm={handlVideoShowToUsers}
          handleCancel={closeShowToUserConfirm}
          message="Are you sure to show video to users?"
          confirmLabel="Confirm"
        />
      </div>
    </div>
  );
};

export default Home;
