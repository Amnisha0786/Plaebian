import { useEffect, useState } from "react";

// hooks
import { useSelector } from "react-redux";
// api
import { API_URL } from "../config";
import { API_END_POINTS } from "../common/apiConstants";
import { getRequest } from "../helper/api";

// library utils
import { toast } from "react-toastify";

export const useGetComment = () => {
  const [commentList, setCommentList] = useState([]);
  const user = useSelector((state) => state.user?.value);
  const [videoDetail, setVideoDetail] = useState({});

  useEffect(() => {
    if (videoDetail?.id && user?.token) {
      getComment(videoDetail?.id);
    }
  }, [videoDetail]);

  async function getComment(id) {
    const response = await getRequest({
      API: `${API_URL}${API_END_POINTS.GET_COMMENTS}${id}`,
    });
    if (response.status === 200) {
      setCommentList(response?.data?.data?.comments);
    } else {
      toast(response?.data || "Something went wrong");
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
