import React from "react";
import ReactModal from "react-modal";

const customStyles = {
  content: {
    height: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    top: "140px",
  },
};

const ConfirmDeleteCommentModal = ({
  showModal = false,
  handleCloseModalDelete = () => {},
  handleDeleteConfirm = () => {},
}) => {
  return (
    <ReactModal isOpen={showModal} style={customStyles}>
      <div className="rejected_title">
        <h2>Are you sure to delete the comment?</h2>
        <button onClick={handleCloseModalDelete} className="cancel_btn">
          Cancal
        </button>
        <button
          onClick={handleDeleteConfirm}
          className="cancel_btn rejected_btn"
        >
          Delete
        </button>
      </div>
      <button onClick={handleCloseModalDelete} className="close-button">
        Close Modal
      </button>
    </ReactModal>
  );
};

export default ConfirmDeleteCommentModal;
