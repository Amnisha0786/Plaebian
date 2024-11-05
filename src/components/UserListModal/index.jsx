// hooks
import { useNavigate } from "react-router-dom";

// library components
// import Modal from "react-modal";

// custom components
import UserListCard from "../UserListCard";

//styles
import styles from "../../pages/Spent/styles.module.scss";

// utils
import { getTitle } from "common/utils";
import Modal from "components/Modal/common/Modal";

const UserListModal = ({ open, onHide, userList }) => {
  const navigate = useNavigate();

  return (
    <Modal
      isOpen={open}
      handleCloseModal={onHide}
      modalClass={styles.emm_modal}
    >
      <h2>Tracked List</h2>
      {userList?.track &&
        userList?.track?.map((item) => (
          <UserListCard
            key={item?.account?.id}
            userDetail={item?.account}
            id={item?.account?.id}
            name={item?.account?.firstName}
            followerCount={item?.account?.followerCount}
            power={item?.account?.power}
            image={item?.account?.pfp}
            title={getTitle(item?.account?.followerCount)}
            onClickProfile={() => navigate(`/userProfile/${item?.account?.id}`)}
          />
        ))}
      {/* <button onClick={onHide} className={styles.close_button}>
        Close Modal
      </button> */}
    </Modal>
  );
};

export default UserListModal;
