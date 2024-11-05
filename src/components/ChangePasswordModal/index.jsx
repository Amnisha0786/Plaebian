import React from "react";

// library components
import Modal from "react-modal";
import * as yup from "yup";

// hooks
import { useYupValidationResolver } from "hooks/useYupValidationResolver";
import usePutRequest from "hooks/usePutRequest";
import { useForm } from "react-hook-form";

//styles
import styles from "pages/Settings/styles.module.scss";

// api
import { API_END_POINTS } from "common/apiConstants";

Modal.setAppElement("body");

const customStyleModal = {
  content: {
    inset: "10px",
    height: "350px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("Current password is required.")
    .min(8, "Current password should be 8 chars minimum."),
  newPassword: yup
    .string()
    .required("New password is required.")
    .min(8, "New password should be 8 chars minimum."),
  confirmPassword: yup
    .string()
    .required("Confirm password is required.")
    .min(8, "Confirm password should be 8 chars minimum."),
});

const ChangePassword = ({ open, handleClose }) => {
  const validationResolver = useYupValidationResolver(changePasswordSchema);
  const { loading, trigger } = usePutRequest();

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
      API_END_POINTS.CHANGE_PASSWORD,
      { oldPassword: data.currentPassword, newPassword: data.newPassword },
      () => {
        handleClose();
      }
    );
  };
  return (
    <Modal
      ariaHideApp={false}
      isOpen={open}
      style={customStyleModal}
      onRequestClose={handleClose}
    >
      <div className={`${styles.forgot_password} ${styles.new_passscreen}`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.forgot_password}>
            <h2>Enter Password </h2>
            <div className={styles.pass}>
              <input
                type="password"
                placeholder="Old Password"
                {...register("currentPassword", { required: true })}
              />
              {errors?.currentPassword && (
                <span className="error-mesage">
                  {errors?.currentPassword.message}
                </span>
              )}
            </div>
            <div className={styles.pass}>
              <input
                type="password"
                placeholder="New Password"
                {...register("newPassword", { required: true })}
              />
              {errors?.newPassword && (
                <span className="error-mesage">
                  {errors?.newPassword.message}
                </span>
              )}
            </div>
            <div className={styles.pass}>
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
          </div>
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

      <button onClick={handleClose} className={styles.close_button}>
        Close Modal
      </button>
    </Modal>
  );
};

export default ChangePassword;
