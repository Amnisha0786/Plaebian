import { useEffect, useState } from "react";

// Library components
import * as yup from "yup";
import { toast } from "react-toastify";

// Library hooks
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

// custom components
import HomeHeader from "components/HomeHeader";
import LoaderSpiner from "components/Loader";
import CoinMove from "components/CoinMove";

// Custom Hooks
import { useYupValidationResolver } from "hooks/useYupValidationResolver";

// Redux
import { startLoading, stopLoading } from "redux/sharedSlices/loader";

// api
import { IMAGE_URL } from "../../config";
import { postRequest, putRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";
import useGetApiOnMount from "hooks/useGetApiOnMount";

import styles from "./styles.module.scss";

export const schema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
});

const EditVideo = () => {
  const user = useSelector((state) => state.user.value);
  const [thumbnaiFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [availableCoin, setAvailableCoin] = useState(user.account.power);
  const [empowerCoin, setEmpowerCoin] = useState(0);
  const [assignedCoins, setAssignedCoins] = useState(1);
  const [assignedCoinsError, setAssignedCoinsError] = useState("");
  const [editValue, setEditValue] = useState({});
  const [empowerFromApi, setEmpowerFromApi] = useState(0);

  const isLoading = useSelector((state) => state.loader.isLoading);
  const params = useParams();
  const videoId = params?.id;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data } = useGetApiOnMount(API_END_POINTS.GET_VIDEO_DETAIL + videoId);

  const validationResolver = useYupValidationResolver(schema);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    mode: "onBlur",
    resolver: validationResolver,
  });

  useEffect(() => {
    if (data?.video) {
      const { video } = data;
      const videoData = { ...editValue };
      videoData["title"] = video?.title;
      videoData["description"] = video?.description;
      videoData["thumbnail"] = video?.thumbnail;
      videoData["videoId"] = video?.id;
      setEmpowerFromApi(video?.power);
      if (video?.thumbnail) {
        setThumbnailPreview(`${IMAGE_URL}${video?.thumbnail}`);
      }
      setEmpowerCoin(video?.power);
      setEditValue(videoData);
    }
  }, [data]);

  useEffect(() => {
    if (Object.keys(editValue)?.length) {
      setValue("videoId", editValue?.videoId);
      if (editValue?.title) {
        setValue("title", editValue?.title);
      }
      if (editValue?.description) {
        setValue("description", editValue?.description);
      }
      if (editValue?.thumbnail) {
        setValue("thumbnail", editValue?.thumbnail);
      }
    }
  }, [editValue]);

  const onSubmitForm = async (values) => {
    dispatch(startLoading());
    try {
      let formData = {};
      formData["title"] = values?.title;
      formData["description"] = values?.description;
      if (thumbnaiFile) {
        formData["thumbnail"] = thumbnaiFile;
      }
      const response = await putRequest({
        API: `video/${values?.videoId}`,
        DATA: formData,
      });
      dispatch(stopLoading());
      if (empowerFromApi < empowerCoin) {
        addEmpowerCoin(response?.data?.video?.id, empowerCoin - empowerFromApi);
      } else if (empowerFromApi > empowerCoin) {
        subtractEmpowerCoin(
          response?.data?.video?.id,
          empowerFromApi - empowerCoin
        );
      } else {
        toast("Video updated successfully.", {
          type: "success",
        });
        if (empowerFromApi < empowerCoin) {
          addEmpowerCoin(
            response?.data?.video?.id,
            empowerCoin - empowerFromApi
          );
        } else if (empowerFromApi > empowerCoin) {
          subtractEmpowerCoin(
            response?.video?.id,
            empowerFromApi - empowerCoin
          );
        } else {
          toast("Video updated successfully.", {
            type: "success",
          });
          navigate("/plebeian");
        }
      }
    } catch (error) {
      toast.error("Something went wrong in updating !");
    } finally {
      dispatch(stopLoading());
    }
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
        setThumbnailFile({
          file: fileData,
          extension,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addEmpowerCoin = async (videoId, power) => {
    try {
      dispatch(startLoading());
      const body = {
        power: power,
        videoId: videoId,
      };
      const response = await postRequest({
        API: `video/addPowerToVideo`,
        DATA: body,
      });
      if (response?.error) {
        toast(response?.error || "Something went wrong", {
          type: "error",
        });
      } else {
        toast("Video updated successfully", {
          type: "success",
        });
      }

      navigate("/plebeian");
    } catch (error) {
      toast(error?.data?.message || "Something went wrong");
    } finally {
      dispatch(stopLoading());
    }
  };

  const subtractEmpowerCoin = async (videoId, power) => {
    try {
      dispatch(startLoading());
      const body = {
        power: power,
      };
      const response = await postRequest({
        API: `video/removePower/${videoId}`,
        DATA: body,
      });
      if (response?.error) {
        toast(response?.error || "Something went wrong", {
          type: "error",
        });
      } else {
        toast("Video updated successfully", {
          type: "success",
        });
      }
      navigate("/plebeian");
    } catch (error) {
      toast(error?.data?.message || "Something went wrong");
      dispatch(stopLoading());
    } finally {
      dispatch(stopLoading());
    }
  };

  const onClickIncreaseDecrease = (condition = "") => {
    if (user?.account?.power > 0) {
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
              return parseInt(prev) + parseInt(assignedCoins);
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
      <HomeHeader text={"Edit Video"} />
      <div className={styles.upload_screen}>
        <div className={styles.heading}>
          <h2>Edit Video </h2>
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
              <label>Upload Thumbnail</label>
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

            <div className={`${styles.formgroup} ${styles.textcenter}`}>
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

export default EditVideo;
