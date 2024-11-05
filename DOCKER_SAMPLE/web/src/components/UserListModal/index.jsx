// hooks
import { useNavigate } from "react-router-dom";

// library components
import Modal from "react-modal";

// custom components
import UserListCard from "../UserListCard";

// utils
import { getTitle } from "common/utils";

const UserListModal = ({ open, onHide, userList }) => {
  const navigate = useNavigate();

  return (
    <Modal isOpen={open}>
      <h2>Tracked List</h2>
      {userList?.track &&
        userList?.track?.map((item) => (
          <UserListCard
            key={item?.account?.id}
            id={item?.account?.id}
            name={item?.account?.firstName}
            image={item?.account?.pfp}
            title={getTitle(item?.account?.followerCount)}
            onClickProfile={() => navigate(`/userProfile/${item?.account?.id}`)}
          />
        ))}
      <button onClick={onHide} className="close-button">
        Close Modal
      </button>
    </Modal>
  );
};

export default UserListModal;
