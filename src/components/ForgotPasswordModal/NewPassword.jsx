// library hooks
import { useForm } from "react-hook-form";
import * as yup from "yup";

// custom hooks
import usePostRequest from "hooks/usePostRequest";
import { useYupValidationResolver } from "hooks/useYupValidationResolver";

// api
import { API_END_POINTS } from "common/apiConstants";

const changePasswordSchema = yup.object({
  newPassword: yup
    .string()
    .required("New password is required.")
    .min(8, "New password should be 8 chars minimum."),
  confirmPassword: yup
    .string()
    .required("Confirm password is required.")
    .min(8, "Confirm password should be 8 chars minimum."),
});

const NewPassword = ({ email, closeModal, setStep, setEmail }) => {
  const validationResolver = useYupValidationResolver(changePasswordSchema);
  const { loading, trigger } = usePostRequest();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    mode: "onBlur",
    resolver: validationResolver,
  });

  const onSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        message: "Confirm password and new password are not matching.",
      });
      return;
    }
    trigger(
      API_END_POINTS.RESET_PASSWORD,
      { email, password: data.newPassword },
      () => {
        closeModal();
        setStep("email-input");
        setEmail("");
      }
    );
  };

  return (
    <div className="forgot_password">
      <h2>Enter Password </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="pass">
          <input
            type="password"
            placeholder="New Password"
            {...register("newPassword", { required: true })}
          />
          {errors?.newPassword && (
            <span className="error-mesage">{errors?.newPassword.message}</span>
          )}
        </div>
        <div className="pass">
          <input
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword", { required: true })}
          />
          {errors?.confirmPassword && (
            <span className="error-mesage">
              {errors?.confirmPassword.message}
            </span>
          )}
        </div>
        <button type="submit" className="" disabled={loading}>
          {" "}
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

export default NewPassword;
