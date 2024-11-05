import { useState } from "react";

// Library Hooks
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Custom components
import Header from "components/Header";

// Library components
import * as yup from "yup";

// Redux
import { useYupValidationResolver } from "hooks/useYupValidationResolver";
import { addDetails } from "redux/sharedSlices/user";
import { startLoading, stopLoading } from "redux/sharedSlices/loader";

// styles
import "./styles.scss";
import LoaderSpiner from "components/Loader";

// api
import { postRequestNoAuth, updateAuthToken } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";
import ForgotPasswordModal from "components/ForgotPasswordModal";

const loginSchema = yup.object({
  email: yup.string().email().required("Email is required"),
  password: yup.string().required("Password is required."),
});

const Login = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const isLoading = useSelector((state) => state.loader.isLoading);
  const validationResolver = useYupValidationResolver(loginSchema);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: validationResolver,
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    dispatch(startLoading());
    try {
      const response = await postRequestNoAuth({
        API: API_END_POINTS.LOGIN,
        DATA: data,
      });
      const responseData = response.data;

      dispatch(addDetails(responseData?.data));
      updateAuthToken(responseData?.data?.token);
      toast("Log in successfull", {
        type: "success",
      });
      navigate("/");
    } catch (error) {
      toast(error?.data?.message || "Something went wrong.", {
        type: "error",
      });
    }

    dispatch(stopLoading());
  };
  const openForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
  };

  return (
    <>
      {isLoading && <LoaderSpiner />}
      <Header />
      <div className="login">
        <h2>Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter Your Email"
              name="email"
              {...register("email", { required: true })}
            />
            {errors?.email && (
              <span className="error-mesage">{errors?.email.message}</span>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="Password"
              placeholder="Password"
              {...register("password", { required: true })}
            />
            {errors?.password && (
              <span className="error-mesage">{errors?.password.message}</span>
            )}
          </div>
          <div className="forgot_pass">
            <span onClick={openForgotPassword}>Forgot Password?</span>
          </div>
          <div className="form-group">
            <button className="submin_btn" type="submit">
              Login
            </button>
          </div>
        </form>
        <span onClick={() => navigate("/signup")} className="sign_up">
          Sign up
        </span>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        handleClose={closeForgotPassword}
      />
    </>
  );
};

export default Login;
