import { useState } from "react";

// hooks
import usePutRequest from "hooks/usePutRequest";

// api
import { API_END_POINTS } from "common/apiConstants";

//styles
import styles from "./styles.module.scss";
import Modal from "components/Modal/common/Modal";

const customStyles = {
  content: {
    height: "470px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const UpdateProfilePicModal = ({ isOpen, handleClose, refetch }) => {
  const [preview, setPreview] = useState("");
  const [pfp, setpfp] = useState();
  const [profilePicErr, setProfilePicErr] = useState("");
  const { loading, trigger } = usePutRequest();

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      setpfp(file);
      reader.onload = (e) => {
        const extension = file.name.split(".").pop();
        const fileData = e?.target?.result;
        if (!extension || !fileData) return;
        setPreview(fileData);

        setProfilePicErr("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!pfp) return setProfilePicErr("Please select new profile pic");
    const data = new FormData();
    data.append("file", pfp);
    trigger(
      API_END_POINTS.CHANGE_PROFILE_PIC,
      data,
      () => {
        handleClose();
        refetch();
        setpfp("");
        setPreview("");
      },
      () => {},
      { "Content-Type": "multipart/form-data" },
      "Profile Pic Updated !"
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      style={customStyles}
      handleCloseModal={handleClose}
      modalClass={styles.emm_modal}
    >
      <div className={`${styles.rejected_title} ${styles.editProfileModal}`}>
        <h2>Upload Profile </h2>
        <div className={`${styles.form_group} ${styles.pic_profile}`}>
          <div className={styles.files}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileInput(e);
              }}
            />
            <div className={styles.ulpad_text}>
              <h4>Upload Profile Pic</h4>
            </div>
            {profilePicErr && (
              <span className="error-mesage">{profilePicErr}</span>
            )}

            {!!Boolean(preview) && (
              <>
                <p>Uploaded Profile Pic</p>
                <img
                  src={preview}
                  alt="Thumbnail preview"
                  className="preview-img"
                />
              </>
            )}
          </div>
        </div>
        <div className={styles.twoBtn}>
          <button onClick={handleClose} className={styles.cancel_btn}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
            className={`${styles.cancel_btn} ${styles.rejected_btn}`}
          >
            {loading ? (
              <div class="spinner-containers">
                <div class="spinners"></div>
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
      {/* <button onClick={handleClose} className={styles.close_button}>
        Close Modal
      </button> */}
    </Modal>
  );
};

export default UpdateProfilePicModal;
