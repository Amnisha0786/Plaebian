import React, { useState } from "react";

// custom components
import NewPassword from "./NewPassword";
import EmailInput from "./EmailInput";
import FillOtp from "./FillOtp";

//styles
import styles from "../UpdateProfilePicModal/styles.module.scss";
import Modal from "components/Modal/common/Modal";

const customStyles = {
  content: {
    height: "fit-content",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const ForgotPasswordModal = ({ isOpen, handleClose }) => {
  const [step, setStep] = useState("email-input");
  const [email, setEmail] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      style={customStyles}
      handleCloseModal={handleClose}
      modalClass={styles.emm_modal}
    >
      {step === "email-input" && (
        <EmailInput setStep={setStep} setEmail={setEmail} email={email} />
      )}
      {step === "otp-input" && <FillOtp setStep={setStep} email={email} />}
      {step === "new-password" && (
        <NewPassword
          setStep={setStep}
          setEmail={setEmail}
          email={email}
          closeModal={handleClose}
        />
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
