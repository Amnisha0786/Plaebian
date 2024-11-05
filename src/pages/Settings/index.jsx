import React, { useMemo, useState } from "react";

// library components
import { Link, useNavigate } from "react-router-dom";

// custom components
import HomeHeader from "components/HomeHeader";
import ChangePassword from "components/ChangePasswordModal";
import SubscriptionButton from "components/SubscriptionButton/SubscriptionButton";
import UpdateProfilePicModal from "components/UpdateProfilePicModal";
import { addAcountToStripe } from "common/utils";

// hooks
import useGetApiOnMount from "hooks/useGetApiOnMount";
import { useDispatch, useSelector } from "react-redux";

// images
import editPencil from "assets/images/edit.png";

// api
import { API_END_POINTS } from "common/apiConstants";

// config
import { IMAGE_URL } from "config";

//styles
import styles from "./styles.module.scss";

// Redux
import { addDetails } from "redux/sharedSlices/user";
import { toast } from "react-toastify";
import { getRequest } from "helper/api";

const Settings = () => {
  // const [showModal, setShowModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [showModalEdit, setShowModalEdit] = useState(false);
  const [processing, setProcessing] = useState(false);
  const user = useSelector((state) => state.user?.value);
  const { data, refetch } = useGetApiOnMount(
    API_END_POINTS.GET_ACCOUNT_PROFILE
  );

  // const openModal = () => {
  //   setShowModal(true);
  // };

  // const handleCloseModal = () => {
  //   setShowModal(false);
  // };

  const openChangePassword = () => {
    setShowChangePassword(true);
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
  };

  const openModalsEdit = () => {
    setShowModalEdit(true);
  };

  // const handleCloseModalEdit = () => {
  //   setShowModal(false);
  // };

  const closeModalsEdit = () => {
    setShowModalEdit(false);
  };

  // const customStyles = {
  //   content: {
  //     height: "220px",
  //     display: "flex",
  //     alignItems: "center",
  //     justifyContent: "center",
  //   },
  // };

  const account = useMemo(() => data?.account, [data]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onClickLogout = async () => {
    dispatch(addDetails({}));
    navigate("/");
  };

  const handleAccountClick = async () => {
    setProcessing(true);
    try {
      if (!user?.token) {
        navigate("/login");
        return toast("You have to login for adding account");
      }
      if (user.account.stripe_account != null) {
        const response = await getRequest({
          API: `${API_END_POINTS.STRIPE_DASHBOARD_LINK}/${
            user.account.stripe_account || ""
          }`,
        });
        if (response?.data?.url) {
          window.location.href = response.data.url;
        } else {
          setTimeout(() => {
            addAcountToStripe(user, setProcessing);
          }, 1000);
        }
      } else {
        addAcountToStripe(user, setProcessing);
      }
    } catch (err) {
      toast(err?.message || "Something went wrong");
    }
    setProcessing(false);
  };

  return (
    <div>
      <HomeHeader text={"Settings/Logout"} className={styles.textColor} />
      <div className="">
        <div className={`${styles.rejected_city} ${styles.mt_4}`}>
          <div className={`${styles.content_botom} ${styles.d_flex}`}>
            {/* <div className="img_text" onClick={openModal}>
              <FortThreeFlag />

              <span>Reject your title</span>
            </div> */}
            <div
              className={`${styles.img_text} ${styles.height_same}`}
              onClick={openChangePassword}
            >
              <span>Change Password</span>
            </div>
            <div className={`${styles.logout_container} ${styles.form_group}`}>
              <button
                className={`${styles.submin_btns} ${styles.logBtn}`}
                onClick={onClickLogout}
              >
                Logout
              </button>
            </div>
          </div>
          <div className={`${styles.signUp} ${styles.settings}`}>
            <div className={styles.ProfilePci}>
              <div className={styles.ProfileImg}>
                <img src={IMAGE_URL + account?.pfp} alt="" />
                <div
                  className={styles.editIcon}
                  onClick={() => openModalsEdit()}
                >
                  <img src={editPencil} alt="" />
                </div>
              </div>

              <div className={styles.subPlans}>
                <div className={styles.subPlansHead}>
                  <h2>Plans</h2>
                  <ul>
                    <li>Price </li>
                    <li>$1</li>
                  </ul>
                  <h2>Features:</h2>
                  <p>Unlimited videos for lifetime</p>
                </div>
                <SubscriptionButton />
              </div>
            </div>
            <div className={styles.box_profile}>
              <div className={styles.nameprofile}>
                <div className={`${styles.state} ${styles.name}`}>
                  <h6>Name</h6>
                  <h4>{`${account?.firstName || ""} ${
                    data?.account?.lastName || ""
                  }`}</h4>
                </div>
                <div className={styles.state}>
                  <h6>Email</h6>
                  <h4>{account?.email || ""}</h4>
                </div>
              </div>
              <div className={styles.nameprofile}>
                <div className={styles.state}>
                  <h6>Country</h6>
                  <h4>{account?.country?.name || ""}</h4>
                </div>
                <div className={styles.state}>
                  <h6>State</h6>
                  <h4>{account?.state?.name || ""}</h4>
                </div>

                <div className={styles.state}>
                  <h6>City</h6>
                  <h4>{account?.city?.name || ""}</h4>
                </div>
              </div>
              <div className={styles.editProfile}>
                <Link to="/editProfile">
                  <button className={styles.submin_btn} type="submit">
                    Edit Profile
                  </button>
                </Link>
                <button
                  className={styles.account_btn}
                  onClick={handleAccountClick}
                >
                  {processing && (
                    <div class="spinner-containers">
                      <div class="spinners spin_margin"></div>
                    </div>
                  )}
                  {user.account.stripe_account != null
                    ? "Dashboard"
                    : "Add Stripe Account"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <UpdateProfilePicModal
          isOpen={showModalEdit}
          handleClose={closeModalsEdit}
          refetch={refetch}
        />
        <ChangePassword
          open={showChangePassword}
          handleClose={closeChangePassword}
        />
      </div>
    </div>
  );
};

export default Settings;
