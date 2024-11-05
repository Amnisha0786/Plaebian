import { useEffect, useState } from "react";

// Library components
import * as yup from "yup";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { State, City } from "country-state-city";

// Library Hooks
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Custom Hooks
import { useYupValidationResolver } from "hooks/useYupValidationResolver";

// Custom components
import HomeHeader from "components/HomeHeader";
import LoaderSpiner from "components/Loader";

// Redux
import { addDetails } from "redux/sharedSlices/user";
import { startLoading, stopLoading } from "redux/sharedSlices/loader";

// styles
// import "./style.scss";

import styles from "./styles.module.scss";

// data
import { countries } from "./data";

// api
import { postRequest, updateAuthToken } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

// config
import { PROJECT_NAME } from "config";

const customStyles = {
  menu: (provided) => ({
    ...provided,
    maxHeight: 170, // set the maximum height of the menu to show 5 options
    overflowY: "auto", // enable vertical scrolling
    zIndex: 9999,
  }),
};

const schema = yup.object({
  email: yup.string().email().required("Email is required"),
  password: yup
    .string()
    .required("Password is required.")
    .min(8, "Password is too short - should be 8 chars minimum."),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  country: yup.object().required("Country is required."),
  state: yup.object().required("State is required."),
  city: yup.object().required("City is required."),
});

const Signup = () => {
  const [pfp, setPfp] = useState(null);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [profilePicErr, setProfilePicErr] = useState("");

  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state?.loader?.isLoading);

  const animatedComponents = makeAnimated();

  const validationResolver = useYupValidationResolver(schema);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    mode: "onBlur",
    resolver: validationResolver,
  });

  useEffect(() => {
    setValue("country", {
      value: "USA",
      label: "USA",
    });
    const allStates = State.getStatesOfCountry("US");
    setStates(
      allStates.map((state) => ({
        value: state.name,
        code: state.isoCode,
        label: state.name,
      }))
    );
  }, []);

  const navigate = useNavigate();
  const onSubmit = async (data) => {
    if (!pfp) {
      return setProfilePicErr("Thumbnail is required");
    }

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("lastName", data.lastName);
      formData.append("firstName", data.firstName);
      formData.append("password", data.password);
      formData.append("city", data.city.value);
      formData.append("country", data.country.value);
      formData.append("state", data.state.value);
      formData.append("referralCode", data.referralCode);
      formData.append("file", pfp);
      dispatch(startLoading());
      const response = await postRequest({
        API: `${API_END_POINTS.SIGNUP}`,
        DATA: formData,
        HEADER: { "Content-Type": "multipart/form-data" },
      });

      if (response?.success) {
        toast("Sign up successfull", {
          type: "success",
        });

        dispatch(addDetails(response?.data));
        updateAuthToken(response?.data?.token);
        navigate("/");
      } else {
        toast(response?.data?.message || "Something went wrong", {
          type: "error",
        });
      }
    } catch (err) {
      toast(err?.message || err?.data?.message || "Something went wrong", {
        type: "error",
      });
    }
    dispatch(stopLoading());
  };

  const handleChange = (newValue) => {
    setValue("state", newValue);
    const allCities = City.getCitiesOfState("US", newValue.code);
    const citiesOptions = allCities.map((city) => ({
      value: city.name,
      label: city.name,
    }));
    setCities(citiesOptions);
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      const file = files[0];
      setPfp(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const extension = file.name.split(".").pop();
        const fileData = e?.target?.result;
        if (!extension || !fileData) return;
        setThumbnailPreview(fileData);
        setProfilePicErr("");
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      {isLoading && <LoaderSpiner />}
      <HomeHeader text={PROJECT_NAME} className={"website-heading"} />
      <div className={styles.signUp}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formgroup}>
            <label>First Name</label>
            <input
              type="text"
              placeholder="Enter Your First Name"
              {...register("firstName", { required: true })}
            />
            {errors?.firstName && (
              <span className="error-mesage">{errors.firstName.message}</span>
            )}
          </div>
          <div className={styles.formgroup}>
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Enter Your Last Name"
              {...register("lastName", { required: true })}
            />
            {errors?.lastName && (
              <span className="error-mesage">{errors.lastName.message}</span>
            )}
          </div>
          <div className={styles.formgroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              {...register("email", { required: true })}
            />
            {errors?.email && (
              <span className="error-mesage">{errors?.email?.message}</span>
            )}
          </div>
          <div className={styles.formgroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter Your Password"
              {...register("password", { required: true })}
            />
            {errors?.password && (
              <span className="error-mesage">{errors?.password?.message}</span>
            )}
          </div>
          <div className={styles.formgroup}>
            <label>Country</label>
            <Controller
              name="country"
              control={control}
              placeholder="Enter Your country"
              render={({ field }) => (
                <Select
                  {...field}
                  options={countries}
                  components={animatedComponents}
                  closeMenuOnSelect={true}
                  styles={customStyles}
                />
              )}
            />
            {errors?.country && (
              <span className="error-mesage">{errors?.country?.message}</span>
            )}
          </div>
          <div className={styles.formgroup}>
            <label>State</label>
            <Controller
              name="state"
              control={control}
              placeholder="Enter Your State"
              render={({ field }) => (
                <Select
                  {...field}
                  options={states}
                  components={animatedComponents}
                  onChange={handleChange}
                  closeMenuOnSelect={true}
                  styles={customStyles}
                />
              )}
            />
            {errors?.state && (
              <span className="error-mesage">{errors?.state?.message}</span>
            )}
          </div>

          <div
            className={`${styles.formgroup} ${styles.city_form} ${styles.city_select}`}
          >
            <label>City</label>
            <Controller
              name="city"
              control={control}
              placeholder="Enter Your City"
              render={({ field }) => (
                <Select
                  {...field}
                  options={cities}
                  components={animatedComponents}
                  closeMenuOnSelect={true}
                  styles={customStyles}
                  menuPortalTarget={document.body}
                />
              )}
            />
            {errors?.city && (
              <span className="error-mesage">{errors?.city?.message}</span>
            )}
          </div>

          <div className={`${styles.formgroup} ${styles.pic_profile} `}>
            <label>Upload Profile Pic</label>
            <div className={styles.files}>
              <input type="file" accept="image/*" onChange={handleFileInput} />
              <div className={styles.ulpad_text}>
                <h4>Upload Profile Pic</h4>
              </div>
              {profilePicErr && (
                <span className="error-mesage">{profilePicErr}</span>
              )}
            </div>
          </div>
          {Boolean(thumbnailPreview) && (
            <>
              <p>Uploaded Profile Pic</p>
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="preview-img"
              />
            </>
          )}
          <div className={styles.formgroup}>
            <label>Referral Code (optional)</label>
            <input
              type="text"
              placeholder="Enter Your referer code"
              {...register("referralCode", { required: false })}
            />
          </div>
          <div className={styles.formgroup}>
            <button className={styles.submin_btn} type="submit">
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Signup;
