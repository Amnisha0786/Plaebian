import { useState, useEffect } from "react";

// Library Components
import ReactModal from "react-modal";

// library hooks
import { useDispatch, useSelector } from "react-redux";

// Custom Components
import HomeHeader from "components/HomeHeader";
import Video from "components/Video";

// redux
import { updateDetails } from "redux/sharedSlices/user";

// api
import { getRequest, postRequest } from "helper/api";
import { startLoading, stopLoading } from "redux/sharedSlices/loader";
import { API_END_POINTS } from "common/apiConstants";

// styles
import "./styles.scss";

const Tutorials = () => {
  const [showModal, setShowModal] = useState(false);
  const [tutorials, setTutorials] = useState([]);
  const [tutorialCount, setTutorialCount] = useState(0);
  const [selectedTutorial, setSelectedTutorial] = useState({});

  const user = useSelector((state) => state.user?.value);

  const dispatch = useDispatch();

  useEffect(() => {
    const getTutorial = async () => {
      dispatch(startLoading());
      const response = await getRequest({ API: API_END_POINTS.TUTORIALS });
      if (response.status === 200) {
        if (response?.data?.data?.tutorials) {
          setTutorials(response?.data?.data?.tutorials);
          setTutorialCount(response?.data?.data?.totalCount);
        }
      }
      dispatch(stopLoading());
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
    if (user?.token && !selectedTutorial?.seen) {
      let body = {
        power: 1,
        videoId: selectedTutorial.id,
      };
      const response = await postRequest({
        API: API_END_POINTS.ADD_POWER_TO_ACCOUNT,
        DATA: body,
      });
      if (response?.status === 200) {
        dispatch(updateDetails({ power: response?.data?.data?.account.power }));
        const currentTutorials = [...tutorials];
        const newTutorials = currentTutorials.map((tutorial) => {
          if (tutorial?.id === selectedTutorial?.id) tutorial.seen = true;
          return tutorial;
        });
        setTutorials(newTutorials);
      }
    }
  };

  return (
    <>
      <HomeHeader text="USE OF POWER OF SOVEREIGNS" />
      <div className="spents tutorial">
        <div className="videos">
          {tutorials?.map((video) => {
            return (
              <div className="video_box" onClick={() => openModal(video)}>
                {video.seen && <span class="badge badge-success">Seen</span>}
                <div className="vid">{video.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rejected_modal tutorial-modal">
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

          <button onClick={handleCloseModal} className="close-button">
            Close Modal
          </button>
        </ReactModal>
      </div>
    </>
  );
};

export default Tutorials;
