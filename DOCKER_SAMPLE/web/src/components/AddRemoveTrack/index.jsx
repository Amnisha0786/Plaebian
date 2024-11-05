// library utils
import { toast } from "react-toastify";

// api
import { API_END_POINTS } from "common/apiConstants";
import { deleteRequest, postRequest } from "helper/api";

const AddRemoveTrack = ({
  data,
  onTrackChange = () => {},
  allData = [],
  index = null,
  setData = () => {},
  isProfile = false,
}) => {
  const onClickAddTrack = async (e) => {
    e.stopPropagation();
    const response = await postRequest({
      API: API_END_POINTS.ADD_TRACK,
      DATA: { accountId: data?.account?.id },
    });
    if (response?.status === 200) {
      toast("Add track successfully.");
      if (!isProfile && index >= 0) {
        const update = [...allData];
        update[index].account.track = { id: response?.data?.data?.id };
        setData(update);
        onTrackChange(data, true);
      } else {
        const update = { ...data };
        update.account.track = { id: response?.data?.data?.id };
        setData(update);
      }
    } else {
      toast(response?.data || "Something went wrong");
    }
  };

  const onClickRemoveTrack = async (e, track) => {
    e.stopPropagation();
    const response = await deleteRequest({
      API: `${API_END_POINTS.REMOVE_TRACK}${track?.id}`,
    });
    if (response?.status === 200) {
      toast("Remove track successfully.");
      if (!isProfile && index >= 0) {
        const update = [...allData];
        update[index].account.track = false;
        setData(update);
        onTrackChange(data, false);
      } else {
        const update = { ...data };
        update.account.track = false;
        setData(update);
      }
    } else {
      toast(response?.data || "Something went wrong");
    }
  };

  return (
    <>
      {data?.account?.track ? (
        <span
          onClick={(e) => onClickRemoveTrack(e, data?.account?.track)}
          className="minusIcon commonIcon"
        >
          -
        </span>
      ) : (
        <span
          onClick={(e) => onClickAddTrack(e)}
          className="plusIcon commonIcon"
        >
          +
        </span>
      )}
    </>
  );
};

export default AddRemoveTrack;
