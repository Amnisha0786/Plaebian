// Library Hooks
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Library components
import * as yup from "yup";

// custom components
import LoaderSpiner from "../../components/Loader";

// Redux
import { useYupValidationResolver } from "../../hooks/useYupValidationResolver";
import { addDetails } from "../../redux/sharedSlices/user";
import { startLoading, stopLoading } from "../../redux/sharedSlices/loader";

// api
import { postRequestNoAuth, updateAuthToken } from "../../api/axios";
import { API_URLS } from "../../api/apiConstants";

// styles
import "./styles.scss";

const loginSchema = yup.object({
  email: yup.string().email().required("Email is required"),
  password: yup.string().required("Password is required."),
});

const Login = () => {
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
        API: API_URLS.LOGIN,
        DATA: data,
      });
      updateAuthToken(response?.data?.token)
      dispatch(addDetails(response?.data));
      toast("Log in successfull", {
        type: "success",
      });
      navigate("/");
    } catch (err) {
      toast(err?.data?.message || "Something went wrong", {
        type: "error",
      });
      dispatch(stopLoading());
    }finally {
      dispatch(stopLoading());
    }
  };
  return (
    <>
      {isLoading && <LoaderSpiner />}
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
          <div className="form-group">
            <button className="submin_btn" type="submit">
              Login
            </button>
          </div>
        </form>
        {/* <span onClick={() => navigate("/signup")} className="sign_up">
          Sign up
        </span> */}
      </div>
    </>
  );
};

export default Login;
