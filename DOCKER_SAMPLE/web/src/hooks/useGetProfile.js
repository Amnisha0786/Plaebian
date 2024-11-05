import { useEffect, useState } from "react";

// hooks
import { useDispatch, useSelector } from "react-redux";

// redux
import { updateDetails } from "../redux/sharedSlices/user";
import { startLoading, stopLoading } from "../redux/sharedSlices/loader";

// api
import { getRequest } from "../helper/api";
import { API_END_POINTS } from "../common/apiConstants";

// library utils
import { toast } from "react-toastify";

const useGetProfile = () => {
  const [profile, setProfile] = useState({});
  const user = useSelector((state) => state.user?.value);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.token) {
      getUserProfile();
    }
  }, []);

  async function getUserProfile() {
    dispatch(startLoading());
    const response = await getRequest({
      API: `${API_END_POINTS.GET_USER_PROFILE}${user?.account?.id}`,
    });
    if (response.status === 200) {
      dispatch(updateDetails(response?.data?.account));
      setProfile(response?.data?.account);
    } else {
      toast(response?.data || "Something went wrong");
    }
    dispatch(stopLoading());
  }

  return profile;
};

export default useGetProfile;
