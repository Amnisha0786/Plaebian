import { useEffect, useState } from "react";

// hooks
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// redux
import { logout, updateDetails } from "../redux/sharedSlices/user";
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
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.token) {
      getUserProfile();
    }
  }, []);

  async function getUserProfile() {
    dispatch(startLoading());
    try {
      const response = await getRequest({
        API: `${API_END_POINTS.GET_USER_PROFILE}${user?.account?.id}`,
      });
      if (response.success) {
        dispatch(updateDetails(response?.data?.account));
        setProfile(response?.data?.account);
      } else if (response?.data.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong !");
    } finally {
      dispatch(stopLoading());
    }
  }

  return profile;
};

export default useGetProfile;
