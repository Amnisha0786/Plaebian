// library utils
import { toast } from "react-toastify";

// api
import { API_END_POINTS } from "common/apiConstants";
import { deleteRequest, postRequest } from "helper/api";

// hooks
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// redux
import { logout } from "redux/sharedSlices/user";

import styles from "./styles.module.scss";

const AddRemoveTrack = ({
  data,
  onTrackChange = () => {},
  allData = [],
  index = null,
  setData = () => {},
  isProfile = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onClickAddTrack = async (e) => {
    e.stopPropagation();
    try {
      const response = await postRequest({
        API: API_END_POINTS.ADD_TRACK,
        DATA: { accountId: data?.account?.id },
      });
      if (response?.success) {
        toast("Add track successfully.");
        if (!isProfile && index >= 0) {
          const update = [...allData];
          update[index].account.track = { id: response?.data?.id };
          setData(update);
          onTrackChange(data, true);
        } else if (response?.status === 401) {
          navigate("/login");
          dispatch(logout());
        } else {
          const update = { ...data };
          update.account.track = { id: response?.data?.id };
          setData(update);
        }
      } else {
        toast(response?.data || "Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong !");
    }
  };

  const onClickRemoveTrack = async (e, track) => {
    e.stopPropagation();
    try {
      const response = await deleteRequest({
        API: `${API_END_POINTS.REMOVE_TRACK}${track?.id}`,
      });
      if (response?.data?.success) {
        toast("Remove track successfully.");
        if (!isProfile && index >= 0) {
          const update = [...allData];
          update[index].account.track = false;
          setData(update);
          onTrackChange(data, false);
        } else if (response?.status === 401) {
          navigate("/login");
          dispatch(logout());
        } else {
          const update = { ...data };
          update.account.track = false;
          setData(update);
        }
      } else {
        toast(response?.data || "Something went wrong");
      }
    } catch (error) {
      console.log(error, "err");
      toast.error("Something went wrong !");
    }
  };

  return (
    <>
      {data?.account?.track ? (
        <span
          onClick={(e) => onClickRemoveTrack(e, data?.account?.track)}
          className={`${styles.minusIcon} ${styles.commonIcon}`}
        >
          -
        </span>
      ) : (
        <span
          onClick={(e) => onClickAddTrack(e)}
          className={`${styles.plusIcon} ${styles.commonIcon}`}
        >
          +
        </span>
      )}
    </>
  );
};

export default AddRemoveTrack;
