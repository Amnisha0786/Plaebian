import React, { useEffect, useState } from "react";

// library components
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import makeAnimated from "react-select/animated";
import { State, City } from "country-state-city";

// custom components
import Header from "components/Header";

// hooks
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useYupValidationResolver } from "hooks/useYupValidationResolver";
import useGetApiOnMount from "hooks/useGetApiOnMount";
import usePutRequest from "hooks/usePutRequest";

// data
import { countries } from "../Signup/data";

// api
import { API_END_POINTS } from "common/apiConstants";

//styles
import "../Signup/style.scss";

const schema = yup.object({
  email: yup.string().email().required("Email is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  country: yup.object().required("Country is required."),
  state: yup.object().required("State is required."),
  city: yup.object().required("City is required."),
});

const customStyles = {
  menu: (provided) => ({
    ...provided,
    maxHeight: 170, // set the maximum height of the menu to show 5 options
    overflowY: "auto", // enable vertical scrolling
    zIndex: 9999,
  }),
};

const allStates = State.getStatesOfCountry("US");

const EditProfile = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const validationResolver = useYupValidationResolver(schema);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    mode: "onBlur",
    resolver: validationResolver,
  });

  const animatedComponents = makeAnimated();

  const { data } = useGetApiOnMount(API_END_POINTS.GET_ACCOUNT_PROFILE);
  const { trigger } = usePutRequest();

  useEffect(() => {
    setValue("country", {
      value: "US",
      label: "USA",
    });
    setStates(
      allStates.map((state) => ({
        value: state.name,
        code: state.isoCode,
        label: state.name,
      }))
    );
  }, []);

  useEffect(() => {
    const account = data?.data?.account;
    if (account) {
      const state = allStates.find(
        (state) => state.name === account?.state?.name
      );
      const cities = City.getCitiesOfState("US", state.isoCode);
      setCities(
        cities.map((city) => ({
          value: city.name,
          code: city.isoCode,
          label: city.name,
        }))
      );
      reset({
        firstName: account?.firstName,
        lastName: account?.lastName,
        email: account?.email,
        country: {
          value: account?.country.name,
          label: account?.country.name,
        },
        city: {
          value: account?.city.name,
          label: account?.city.name,
        },
        state: {
          value: account?.state.name,
          label: account?.state.name,
        },
      });
    }
  }, [data]);

  const handleChange = (newValue) => {
    setValue("state", newValue);
    const allCities = City.getCitiesOfState("US", newValue.code);
    const citiesOptions = allCities.map((city) => ({
      value: city.name,
      label: city.name,
    }));
    setCities(citiesOptions);
  };

  const onSubmit = async (data) => {
    const body = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      city: data.city.value,
      country: data.country.value,
      state: data.state.value,
    };
    trigger(API_END_POINTS.UPDATE_USER_PROFILE, body, () => {
      navigate("/settings");
    });
  };

  return (
    <div>
      <Header />
      <div className="">
        <div className="rejected-city mt-4">
          <div className="signUp editProfile">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="Enter Your First Name"
                  {...register("firstName", { required: true })}
                />
                {errors?.lastName && (
                  <span className="error-mesage">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Enter Your Last Name"
                  {...register("lastName", { required: true })}
                />
                {errors?.lastName && (
                  <span className="error-mesage">
                    {errors.lastName.message}
                  </span>
                )}
              </div>

              <div className="form-group">
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
              <div className="form-group">
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
                  <span className="error-mesage">
                    {errors?.country?.message}
                  </span>
                )}
              </div>

              <div className="form-group">
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

              <div className="form-group city-form">
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
                      menuPlacement="top"
                    />
                  )}
                />
                {errors?.city && (
                  <span className="error-mesage">{errors?.city?.message}</span>
                )}
              </div>

              <div className="form-group">
                <button className="submin_btn" type="submit">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
