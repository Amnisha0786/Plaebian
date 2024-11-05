import { useEffect } from "react";

// library hooks
import { useForm } from "react-hook-form";
import * as yup from "yup";

// custom hooks
import usePostRequest from "hooks/usePostRequest";
import { useYupValidationResolver } from "hooks/useYupValidationResolver";

//styles
import styles from "pages/Login/styles.module.scss";

// api
import { API_END_POINTS } from "common/apiConstants";
import Modal from "components/Modal/common/Modal";

const emailSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required"),
});

const EmailInput = ({ email, setStep, setEmail }) => {
  const validationResolver = useYupValidationResolver(emailSchema);
  const { loading, trigger } = usePostRequest();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onBlur",
    resolver: validationResolver,
  });

  useEffect(() => {
    if (email) {
      reset({ email });
    }
  }, [email, reset]);

  const onSubmit = async (data) => {
    trigger(API_END_POINTS.FORGOT_PASSWORD, { email: data.email }, () => {
      setEmail(data.email);
      setStep("otp-input");
    });
  };

  return (
    <div className={`${styles.forgot_password} ${styles.new_passscreen}`}>
      <h2>Forgot Password </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          name="email"
          placeholder="Please Enter Email Address"
          {...register("email", { required: true })}
        />
        {errors?.email && (
          <span className="error-mesage">{errors?.email.message}</span>
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

export default EmailInput;
