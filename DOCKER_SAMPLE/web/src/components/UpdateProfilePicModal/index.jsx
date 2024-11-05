import { useState } from "react";
import ReactModal from "react-modal";

// hooks
import usePutRequest from "hooks/usePutRequest";

// api
import { API_END_POINTS } from "common/apiConstants";

//styles
import "./styles.scss";

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
      },
      () => {},
      { "Content-Type": "multipart/form-data" }
    );
  };

  return (
    <ReactModal isOpen={isOpen} style={customStyles}>
      <div className="rejected_title editProfileModal">
        <h2>Upload Profile</h2>
        <div className="form-group pic-profile">
          <div className="files">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileInput(e);
              }}
            />
            <div className="ulpad_text">
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
        <button onClick={handleClose} className="cancel_btn">
          Cancal
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="cancel_btn rejected_btn"
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
      <button onClick={handleClose} className="close-button">
        Close Modal
      </button>
    </ReactModal>
  );
};

export default UpdateProfilePicModal;
