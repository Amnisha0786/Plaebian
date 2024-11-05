import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

//styles
import styles from "./styles.module.scss";

// api
import { deleteRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

// library utils
import { toast } from "react-toastify";

// redux
import { logout } from "redux/sharedSlices/user";

// hooks
import { useDispatch } from "react-redux";
import Modal from "components/Modal/common/Modal";

const customStyles = {
  content: {
    inset: "10px",
    color: "black",
    height: "250px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
};

const DeleteVideoModal = ({
  isOpen,
  handleClose,
  id,
  onSuccess = () => {},
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteRequest({
        API: `${API_END_POINTS.UPDATE_VIDEO}/${id}`,
      });

      if (response?.data?.success) {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
        navigate("/plebeian");
        toast.success("Video deleted succesfully !");
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast.error(response?.data?.message, "Something went wrong !");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong !");
    }
    setLoading(false);
  };
  return (
    <Modal
      isOpen={isOpen}
      style={customStyles}
      handleCloseModal={handleClose}
      modalClass={styles.emm_modal}
    >
      <h3>Are you sure to delete this Video ?</h3>
      <div className={styles.confirmationButtons}>
        <button className={styles.delete_button} onClick={handleDelete}>
          {loading ? (
            <div className="spinner-containers">
              <div className="spinners"></div>
            </div>
          ) : (
            "Delete"
          )}
        </button>
        <button onClick={handleClose} className={styles.cancel_button}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default DeleteVideoModal;
