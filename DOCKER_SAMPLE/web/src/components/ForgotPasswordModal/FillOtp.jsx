// library hooks
import { useForm } from "react-hook-form";
import * as yup from "yup";

// custom hooks
import usePostRequest from "hooks/usePostRequest";
import { useYupValidationResolver } from "hooks/useYupValidationResolver";

// api
import { API_END_POINTS } from "common/apiConstants";

const otpSchema = yup.object({
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^[0-9]{6}/g, "Please enter a valid otp"),
});

const FillOtp = ({ email, setStep }) => {
  const validationResolver = useYupValidationResolver(otpSchema);
  const { loading, trigger } = usePostRequest();

  const handleChangeEmail = () => setStep("email-input");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: validationResolver,
  });

  const onSubmit = (data) => {
    trigger(API_END_POINTS.VERIFY_OTP, { otp: data.otp, email }, () => {
      setStep("new-password");
    });
  };

  return (
    <div className="forgot_password">
      <h2>Enter Otp </h2>
      <div className="changeEmail">
        <p>
          Please enter the OTP sent to {email}{" "}
          <button className="confirmOld" onClick={handleChangeEmail}>
            Change Email
          </button>
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="number"
          name="otp"
          {...register("otp", { required: true })}
          placeholder="Please Enter Otp"
        />
        {errors?.otp && (
          <span className="error-mesage">{errors?.otp.message}</span>
        )}
        <button type="submit" disabled={loading}>
          {loading ? (
            <div class="spinner-containers">
              <div class="spinners"></div>
            </div>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </div>
  );
};

export default FillOtp;
