import React from "react";

// styles
import styles from "./styles.module.scss";

//components
import Modal from "components/Modal/common/Modal";

const customStyles = {
  content: {
    inset: "10px",
    color: "black",
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
    <Modal
      isOpen={showModal}
      style={customStyles}
      handleCloseModal={handleCloseModalDelete}
      modalClass={styles.emm_modal}
    >
      <div className={styles.rejected_title}>
        <h2>Are you sure to delete the comment?</h2>
        <button onClick={handleCloseModalDelete} className={styles.cancel1_btn}>
          Cancel
        </button>
        <button
          onClick={handleDeleteConfirm}
          className={`${styles.cancel_btn} ${styles.rejected_btn}`}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteCommentModal;
