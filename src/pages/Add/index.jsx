import { useRef, useState } from "react";

// Library components
// import { ReactMediaRecorder } from "react-media-recorder";
import * as yup from "yup";
import { toast } from "react-toastify";

// Library hooks
import { useForm } from "react-hook-form";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

// custom components
// import VideoPreview from "components/videoPreview";
import HomeHeader from "components/HomeHeader";
import LoaderSpiner from "components/Loader";
import CoinMove from "components/CoinMove";
import Video from "components/Video";

// Custom Hooks
import { useYupValidationResolver } from "hooks/useYupValidationResolver";

// Redux
import { logout, updateDetails } from "redux/sharedSlices/user";
import { startLoading, stopLoading } from "redux/sharedSlices/loader";

// Styles
import styles from "./styles.module.scss";

// api
import { postRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

// utils
import { convertBase64ToFile } from "common/utils";

export const schema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
});

const Add = () => {
  const user = useSelector((state) => state.user.value);
  const videoRefSave = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnaiFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  // const [recordingStarted, setRecordingStarted] = useState(null);
  const [availableCoin, setAvailableCoin] = useState(user.account.power);
  const [empowerCoin, setEmpowerCoin] = useState(0);
  const [assignedCoins, setAssignedCoins] = useState(1);
  const [assignedCoinsError, setAssignedCoinsError] = useState("");

  const isLoading = useSelector((state) => state.loader.isLoading);

  const validationResolver = useYupValidationResolver(schema);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: validationResolver,
  });

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const onSubmitForm = async (values) => {
    let videoToSend = videoFile;
    if (!videoToSend && videoRefSave.current) {
      let response = await fetch(videoRefSave.current);
      let data = await response.blob();
      let metadata = {
        type: "video/mp4",
      };
      videoToSend = new File([data], "test.mp4", metadata);
    }

    if (!videoToSend) {
      return toast("Either upload or record the video", {
        type: "error",
      });
    }
    const { title, description, assignedCoins } = values;
    if (assignedCoins <= 0 || empowerCoin <= 0) {
      return toast("Please assign at least 1 coin", {
        type: "error",
      });
    }
    if (values.assignedCoins > 20) {
      return toast("Please assign coins less than 20", {
        type: "error",
      });
    }
    try {
      dispatch(startLoading());
      const formData = new FormData();
      formData.append("video", videoToSend);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("power", empowerCoin.toString());
      if (!!thumbnaiFile) {
        formData.append("thumbnail", thumbnaiFile);
      } else {
        let thumbnailFromVideo = await generateVideoThumbnails(videoToSend, 1);
        const blob = convertBase64ToFile(thumbnailFromVideo?.[1]);
        formData.append("thumbnail", blob);
      }
      const response = await postRequest({
        API: API_END_POINTS.ADD_VIDEO,
        DATA: formData,
        HEADER: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch(stopLoading());
      if (response.success) {
        toast("Video added sccessfully", {
          type: "success",
        });
        dispatch(updateDetails(response.data?.video?.account));
        navigate("/");
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data?.message || "Something went wrong", {
          type: "error",
        });
      }
    } catch (err) {
      toast(err?.data?.message || "Something went wrong", {
        type: "error",
      });
    }
    dispatch(stopLoading());
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    const mime = file.type;
    const rd = new FileReader();
    rd.onload = function (e) {
      const blob = new Blob([e.target.result], { type: mime });
      const url = URL.createObjectURL(blob);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.addEventListener("loadedmetadata", function () {
        if (video.duration > 60) {
          toast("Video must be less then 1 minute");
        } else {
          setVideoFile(file);
        }
      });
      video.src = url;
    };
    rd.readAsArrayBuffer(file);
  };

  const handleThumbnailChange = (e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e?.target?.result;
        const extension = file.name.split(".").pop();
        if (!extension || !fileData) return;
        setThumbnailPreview(fileData);
        setThumbnailFile(files[0]);
      };
      reader.readAsDataURL(file);
    }
  };

  const onClickIncreaseDecrease = (condition = "") => {
    if (user?.account?.power) {
      if (assignedCoins > availableCoin) {
        setAssignedCoinsError("");
      }
      if (condition === "available") {
        if (availableCoin >= 0 && availableCoin !== 0) {
          setAvailableCoin((prev) => {
            if (prev > 0 && prev >= parseInt(assignedCoins)) {
              return prev - parseInt(assignedCoins);
            } else {
              return prev;
            }
          });
          setEmpowerCoin((prev) => {
            if (prev >= 0 && availableCoin >= parseInt(assignedCoins)) {
              return prev + parseInt(assignedCoins);
            } else {
              return prev;
            }
          });
        }
      } else {
        if (empowerCoin >= 0 && empowerCoin !== 0) {
          setAvailableCoin((prev) => {
            if (prev >= 0 && empowerCoin >= parseInt(assignedCoins)) {
              return prev + parseInt(assignedCoins);
            } else {
              return prev;
            }
          });
          setEmpowerCoin((prev) => {
            if (prev > 0 && prev >= parseInt(assignedCoins)) {
              return prev - parseInt(assignedCoins);
            } else {
              return prev;
            }
          });
        }
      }
    } else {
      toast("You have not sufficient coins to move.");
    }
  };

  const assignMovedCoin = (e) => {
    const { value } = e.target;
    setAssignedCoins(value);
    if (value > parseInt(availableCoin)) {
      setAssignedCoinsError(`Value should be = or < ${availableCoin}`);
    } else {
      setAssignedCoinsError("");
    }
  };

  return (
    <>
      {isLoading && <LoaderSpiner />}
      <HomeHeader
        text={"Create a video and empower it with coins for others to see it"}
      />
      <div className={styles.upload_screen}>
        <div className={styles.heading}>
          <h2>Upload </h2>
        </div>
        <div className={styles.form}>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <div className={styles.formgroup}>
              <label>Title</label>
              <input
                type="text"
                placeholder="Title"
                {...register("title", { required: true })}
              />
              {errors?.title && (
                <span className="error-mesage">{errors.title?.message}</span>
              )}
            </div>
            <div className={styles.formgroup}>
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                cols="50"
                {...register("description", { required: true })}
              ></textarea>
              {errors?.description && (
                <span className="error-mesage">
                  {errors.description?.message}
                </span>
              )}
            </div>
            <div className={styles.formgroup}>
              <label>Upload Video</label>
              <div className={styles.files}>
                <input
                  type="file"
                  accept="video/mp4,video/x-m4v,video/*"
                  onChange={handleVideoChange}
                />
                <div className={styles.ulpad_text}>
                  <h4>Upload Video</h4>
                </div>
                {videoFile && (
                  <>
                    <p> Uploaded Video</p>
                    <Video
                      src={URL.createObjectURL(videoFile)}
                      width="400"
                      controls
                    />
                  </>
                )}
              </div>
            </div>

            {/* <p>OR</p>
            <div className="form-group">
              <label>Record Live Video</label>
              <div className="files">
                <ReactMediaRecorder
                  video
                  render={({
                    startRecording,
                    stopRecording,
                    mediaBlobUrl,
                    previewStream,
                  }) => {
                    videoRefSave.current = mediaBlobUrl;
                    return (
                      <div className="video_section">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecordingStarted(true);
                            startRecording(e);
                          }}
                          disabled={recordingStarted}
                        >
                          Start Recording
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecordingStarted(false);
                            stopRecording();
                          }}
                          disabled={!recordingStarted}
                        >
                          Stop Recording
                        </button>
                        {previewStream?.active && (
                          <VideoPreview stream={previewStream} />
                        )}
                        {mediaBlobUrl && (
                          <>
                            <p>Recoreded Video</p>
                            <Video className={"mirror-preview"} src={mediaBlobUrl} autoPlay loop controls />
                          </>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </div> */}
            <div className={styles.formgroup}>
              <label>Upload Thumbnail (optional)</label>
              <div className={styles.files}>
                <input type="file" onChange={handleThumbnailChange} />
                <div className={styles.ulpad_text}>
                  <h4>Upload Thumbnail</h4>
                </div>
                {Boolean(thumbnailPreview) && (
                  <>
                    <p>Uploaded Thumbnail</p>
                    <img src={thumbnailPreview} alt="Thumbnail preview" />
                  </>
                )}
              </div>
            </div>

            <div className={styles.formgroup}>
              <div className={styles.videoContent}>
                <p>
                  The Number of people that will see your video will be equal to
                  the number of coins you give it
                </p>

                <p>
                  <strong>Example</strong>: Empowering your video with 10 coins
                  will make 10 people see your video from beginning to end{" "}
                </p>
              </div>
            </div>

            <CoinMove
              onChangeInput={assignMovedCoin}
              moveCoinValue={assignedCoins}
              availableCoin={availableCoin}
              empowerCoin={empowerCoin}
              onClickIncreaseDecrease={(value) =>
                onClickIncreaseDecrease(value)
              }
              assignedCoinsError={assignedCoinsError}
            />

            <div className={`${styles.textcenter} ${styles.formgroup}`}>
              <button
                type="submit"
                className={styles.btnsub}
                disabled={isLoading}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Add;
