import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// library components
import Modal from "react-modal";

//styles
import "./styles.scss";

// api
import { deleteRequest } from "helper/api";
import { API_URL } from "config";
import { toast } from "react-toastify";

const customStyles = {
  content: {
    height: "250px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
};

const DeleteVideoModal = ({ isOpen, handleClose, id }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteRequest({
        API: `${API_URL}video/${id}`,
      });
      navigate("/plebeian");
      toast.success("Vedio deleted succesfully !");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong !");
    }
    setLoading(false);
  };
  return (
    <Modal isOpen={isOpen} style={customStyles} onRequestClose={handleClose}>
      <h3>Are you sure to delete this Vedio ?</h3>
      <div className="confirmationButtons">
        <button className="delete-button" onClick={handleDelete}>
          {loading ? (
            <div class="spinner-containers">
              <div class="spinners"></div>
            </div>
          ) : (
            "Delete"
          )}
        </button>
        <button onClick={handleClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default DeleteVideoModal;
