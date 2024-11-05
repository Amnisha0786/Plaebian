import { useState, useEffect } from "react";

// Library Components
import ReactModal from "react-modal";

// library hooks
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Custom Components
import HomeHeader from "components/HomeHeader";
import Video from "components/Video";

// redux
import { logout, updateDetails } from "redux/sharedSlices/user";

// api
import { getRequest, postRequest } from "helper/api";
import { startLoading, stopLoading } from "redux/sharedSlices/loader";
import { API_END_POINTS } from "common/apiConstants";

// styles
import styles from "./styles.module.scss";

// library utils
import { toast } from "react-toastify";

const Tutorials = () => {
  const [showModal, setShowModal] = useState(false);
  const [tutorials, setTutorials] = useState([]);
  const [tutorialCount, setTutorialCount] = useState(0);
  const [selectedTutorial, setSelectedTutorial] = useState({});

  const user = useSelector((state) => state.user?.value);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const getTutorial = async () => {
      dispatch(startLoading());
      try {
        const response = await getRequest({ API: API_END_POINTS.TUTORIALS });
        if (response.success) {
          if (response?.data?.tutorials) {
            setTutorials(response?.data?.tutorials);
            setTutorialCount(response?.data?.totalCount);
          }
        } else if (response?.status === 401) {
          navigate("/login");
          dispatch(logout());
        }
      } catch (error) {
        toast.error("Something went wrong !");
      } finally {
        dispatch(stopLoading());
      }
    };

    getTutorial();
  }, []);

  const openModal = (tutorial) => {
    setShowModal(true);
    setSelectedTutorial(tutorial);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const customStyles = {
    content: {
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  const handleFullWatch = async () => {
    try {
      if (user?.token && !selectedTutorial?.seen) {
        let body = {
          power: 1,
          videoId: selectedTutorial.id,
        };
        const response = await postRequest({
          API: API_END_POINTS.ADD_POWER_TO_ACCOUNT,
          DATA: body,
        });
        if (response?.success) {
          dispatch(updateDetails({ power: response?.data?.account.power }));
          const currentTutorials = [...tutorials];
          const newTutorials = currentTutorials.map((tutorial) => {
            if (tutorial?.id === selectedTutorial?.id) tutorial.seen = true;
            return tutorial;
          });
          setTutorials(newTutorials);
        }
      }
    } catch (error) {
      toast.error("Something went wrong !");
    }
  };

  return (
    <>
      <HomeHeader text="USE OF POWER OF SOVEREIGNS" />
      <div className={`${styles.spents} ${styles.tutorial}`}>
        <div className={styles.videos}>
          {tutorials?.map((video) => {
            return (
              <div
                className={styles.video_box}
                onClick={() => openModal(video)}
              >
                {video.seen && (
                  <span class={`${styles.badge} ${styles.badge_success}`}>
                    Seen
                  </span>
                )}
                <div className={styles.vid}>{video.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`tutorial-modal ${styles.rejected_modal} ${styles.tutorial_modal}`}
      >
        <ReactModal isOpen={showModal} style={customStyles}>
          <Video
            src={selectedTutorial?.url}
            poster={selectedTutorial?.thumbnail}
            onEnded={handleFullWatch}
            autoPlay
            controls
            width="300"
            height="200"
          />

          <button onClick={handleCloseModal} className={styles.close_button}>
            Close Modal
          </button>
        </ReactModal>
      </div>
    </>
  );
};

export default Tutorials;
