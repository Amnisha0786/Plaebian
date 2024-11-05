import ReactModal from "react-modal";

import "./style.scss"

const customStyles = {
  content: {
    height: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    top: "140px",
  },
};

const ConfirmModal = ({
  showModal = false,
  handleConfirm = () => {},
  handleCancel = () => {},
  message="",
  confirmLabel=""
}) => {
  return (
    <ReactModal isOpen={showModal} style={customStyles}>
      <div className="rejected_title">
        <h2>{message}</h2>
        <button onClick={handleCancel} className="cancel_btn">
          Cancal
        </button>
        <button
          onClick={handleConfirm}
          className="cancel_btn rejected_btn"
        >
          {confirmLabel}
        </button>
      </div>
      <button onClick={handleCancel} className="close-button">
        Close Modal
      </button>
    </ReactModal>
  );
};

export default ConfirmModal;
