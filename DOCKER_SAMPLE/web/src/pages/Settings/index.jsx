import React, { useMemo, useState } from "react";

// library components
import ReactModal from "react-modal";
import { Link, useNavigate } from "react-router-dom";

// custom components
import Header from "components/Header";
import ChangePassword from "components/ChangePasswordModal";
import UpdateProfilePicModal from "components/UpdateProfilePicModal";

// hooks
import useGetApiOnMount from "hooks/useGetApiOnMount";
import { useDispatch } from "react-redux";

// images
import editPencil from "assets/images/edit.png";

// api
import { API_END_POINTS } from "common/apiConstants";

// config
import { IMAGE_URL } from "config";

//styles
import "../Plebeian/styles.scss";

// Redux
import { addDetails } from "redux/sharedSlices/user";
import HomeHeader from "components/HomeHeader";

const Settings = () => {
  const [showModal, setShowModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [showModalEdit, setShowModalEdit] = useState(false);
  const { data, refetch } = useGetApiOnMount(
    API_END_POINTS.GET_ACCOUNT_PROFILE
  );

  const openModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const openChangePassword = () => {
    setShowChangePassword(true);
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
  };

  const openModalsEdit = () => {
    setShowModalEdit(true);
  };

  const handleCloseModalEdit = () => {
    setShowModal(false);
  };

  const closeModalsEdit = () => {
    setShowModalEdit(false);
  };

  const customStyles = {
    content: {
      height: "220px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  const account = useMemo(() => data?.data?.account, [data]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onClickLogout = async () => {
    dispatch(addDetails({}));
    navigate("/");
  };

  const handleSettingsClick = () => navigate("/plebeian")

  return (
    <div>
      <HomeHeader text={"Settings/Logout"} className={"textColor"} onClickText={handleSettingsClick}/>
      <div className="">
        <div className="rejected-city mt-4">
          <div className="content_botom d-flex text-center justify-content-between">
            {/* <div className="img_text" onClick={openModal}>
              <FortThreeFlag />

              <span>Reject your title</span>
            </div> */}
            <div className="img_text height_same" onClick={openChangePassword}>
              <span>Change Password</span>
            </div>
            <div className="logout_container form-group">
              <button className="submin_btns logBtn" onClick={onClickLogout}>
                Logout
              </button>
            </div>
          </div>
          <div className="signUp settings">
            <div className="ProfilePci">
              <div className="ProfileImg">
                <img src={IMAGE_URL + account?.pfp} alt="" />
                <div className="editIcon" onClick={() => openModalsEdit()}>
                  <img src={editPencil} alt="" />
                </div>
              </div>
            </div>
            <div className="box-profile">
              <div className="nameprofile">
                <div className="state">
                  <h6>Name</h6>
                  <h4>{`${account?.firstName || ""} ${data?.account?.lastName || ""
                    }`}</h4>
                </div>
                <div className="state">
                  <h6>Email</h6>
                  <h4>{account?.email || ""}</h4>
                </div>
              </div>
              <div className="nameprofile">
                <div className="state">
                  <h6>Country</h6>
                  <h4>{account?.country?.name || ""}</h4>
                </div>
                <div className="state">
                  <h6>State</h6>
                  <h4>{account?.state?.name || ""}</h4>
                </div>

                <div className="state">
                  <h6>City</h6>
                  <h4>{account?.city?.name || ""}</h4>
                </div>
              </div>
              <div className="editProfile">
                <Link to="/editProfile">
                  <button className="submin_btn" type="submit">
                    Edit Profile
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <UpdateProfilePicModal
          isOpen={showModalEdit}
          handleClose={closeModalsEdit}
          refetch={refetch}
        />

        <div className="rejected_modal">
          <ReactModal isOpen={showModal} style={customStyles}>
            <div className="rejected_title">
              <h2>Are you sure to reject the title?</h2>
              <button onClick={handleCloseModal} className="cancel_btn">
                Cancel
              </button>
              <button
                onClick={handleCloseModal}
                className="cancel_btn rejected_btn"
              >
                Reject
              </button>
            </div>
            <button onClick={handleCloseModal} className="close-button">
              Close Modal
            </button>
          </ReactModal>
        </div>
        <ChangePassword
          open={showChangePassword}
          handleClose={closeChangePassword}
        />
      </div>
    </div>
  );
};

export default Settings;
