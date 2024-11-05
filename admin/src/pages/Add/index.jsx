import React, { useState } from "react";

// library components
import * as yup from "yup";
import { toast } from "react-toastify";

// custom components
import LoaderSpiner from "src/components/Loader";
import Header from "../../components/Header";

// hooks
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// API
import { API_URLS } from "src/api/apiConstants";
import { postRequest } from "src/api/axios";

// Redux
import { startLoading, stopLoading } from "src/redux/sharedSlices/loader";
import { useYupValidationResolver } from "src/hooks/useYupValidationResolver";

// images
// import closeIcon from "../../assets/close.png";

// styles
import "./styles.scss";

export const schema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
});

const Add = () => {
  // const user = useSelector((state) => state.user.value);
  const [videoFile, setVideoFile] = useState(null);
  const validationResolver = useYupValidationResolver(schema);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: validationResolver,
  });

  const isLoading = useSelector((state) => state.loader.isLoading);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmitForm = async (values) => {
    if (!videoFile) {
      return toast("Please upload the video", {
        type: "error",
      });
    }
    const { title, description } = values;

    try {
      dispatch(startLoading());
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("title", title);
      formData.append("description", description);

      await postRequest({
        API: API_URLS.UPLOAD_TUTORIAL,
        DATA: formData,
        HEADER: {
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(stopLoading());

      toast("Tutorial added sccessfully", {
        type: "success",
      });

      navigate("/");
    } catch (err) {
      dispatch(stopLoading());
      toast(err?.data?.message || "Something went wrong", {
        type: "error",
      });
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
  };

  return (
    <div>
      <Header />
      {isLoading && <LoaderSpiner />}
      <div className="admin_wraper">
        <div className="add-form">
          <h2>Add Video</h2>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <div className="form-group">
              <label>Upload Video</label>
              <input
                type="file"
                accept="video/mp4,video/x-m4v,video/*"
                onChange={handleVideoChange}
              />
              {videoFile && (
                <div className="upload-video">
                  {/* <img src={closeIcon} alt="close-icon" onClick={() => setVideoFile(null)}/> */}
                  <video width="400" height="400" controls>
                    <source src={URL.createObjectURL(videoFile)} />
                  </video>
                </div>
              )}
            </div>
            <div className="form-group">
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
            <div className="form-group">
              <label>Description</label>
              <textarea
                id="w3review"
                name="w3review"
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
            <button className="common_btn">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;
