import React, { useState } from "react";

// library components
import Modal from "react-modal";

// custom components
import NewPassword from "./NewPassword";
import EmailInput from "./EmailInput";
import FillOtp from "./FillOtp";

//styles
import "../UpdateProfilePicModal/styles.scss";

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
    <Modal isOpen={isOpen} style={customStyles} onRequestClose={handleClose}>
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
      <button onClick={handleClose} className="close-button">
        Close Modal
      </button>
    </Modal>
  );
};

export default ForgotPasswordModal;
