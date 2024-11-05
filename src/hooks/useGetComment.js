import { useEffect, useState } from "react";

// hooks
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

//redux
import { logout } from "redux/sharedSlices/user";

// api
import { API_END_POINTS } from "../common/apiConstants";
import { getRequest } from "../helper/api";

// library utils
import { toast } from "react-toastify";

export const useGetComment = () => {
  const [commentList, setCommentList] = useState([]);
  const user = useSelector((state) => state.user?.value);
  const [videoDetail, setVideoDetail] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (videoDetail?.id && user?.token) {
      getComment(videoDetail?.id);
    }
  }, [videoDetail]);

  async function getComment(id) {
    try {
      const response = await getRequest({
        API: `${API_END_POINTS.GET_COMMENTS}${id}`,
      });

      if (response.success) {
        setCommentList(response?.data?.comments);
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong !");
    }
  }

  return {
    commentList,
    getComment,
    setVideoDetail,
    setCommentList,
    videoDetail,
  };
};
