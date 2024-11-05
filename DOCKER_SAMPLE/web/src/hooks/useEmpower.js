import { useEffect, useState } from "react";

// redux
import { startLoading, stopLoading } from "../redux/sharedSlices/loader";
import { updateDetails } from "../redux/sharedSlices/user";

// hooks
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getRequest, getRequestNoAuth, postRequest } from "../helper/api";

// api
import { API_END_POINTS } from "../common/apiConstants";

// library utils
import { toast } from "react-toastify";

const useEmpower = () => {
  const [allPost, setAllPost] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const user = useSelector((state) => state.user?.value);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    dispatch(startLoading());
    let response = null;
    if (user?.token) {
      response = await getRequest({
        API: `${API_END_POINTS.GET_VIDEO}?skip=${
          allPost.length ? allPost.length : 0
        }&&take=1`,
      });
    } else {
      response = await getRequestNoAuth({
        API: `${API_END_POINTS.GET_ALL_VIDEOS}?skip=${
          allPost.length ? allPost.length : 0
        }&&take=1`,
      });
    }

    dispatch(stopLoading());
    if (response.status === 200) {
      let updatePost = [...response?.data?.data?.videos];
      updatePost = updatePost.map((item) => {
        if (!item.empowered) {
          item.empowered = 0;
        }
        return item;
      });
      setAllPost((prev) => [...prev, ...updatePost]);
      setTotalCount(response?.data?.totalCount);
    } else {
      toast(response?.data || "Some thing went wrong");
    }
  }

  const onClickEmpower = async (post, index) => {
    if (!user?.token) {
      navigate("/login");
      return toast("You have to login to empower");
    }
    let body = {};
    let url = "";
    if (post?.empowered) {
      body["power"] = post?.empowered;
      url = `${API_END_POINTS.REMOVE_POWER_VIDEO}${post.id}`;
    } else {
      body["power"] = 1;
      body["videoId"] = post.id;
      url = API_END_POINTS.ADD_POWER_TO_VIDEO;
    }
    const response = await postRequest({ API: url, DATA: body });
    if (response.status === 200) {
      if (response?.data?.data?.video) {
        let updatePost = [...allPost];
        if (post?.empowered) {
          updatePost[index]["empowered"] = response?.data?.empowered || 0;
        } else {
          updatePost[index]["empowered"] = post?.empowered + 1;
        }
        updatePost[index]["power"] = response?.data?.data?.video.power;
        if (parseInt(user?.account?.power) > 0) {
          dispatch(updateDetails({ power: user?.account?.power - 1 }));
        }
        setAllPost(updatePost);
      }
    } else {
      toast(response?.data || "Something went wrong");
    }
  };

  const handleFullWatch = async (post, index) => {
    if (user?.token) {
      const previousCoinCount = user?.account?.power;
      let body = {
        power: 1,
        videoId: post.id,
      };
      const response = await postRequest({
        API: API_END_POINTS.ADD_POWER_TO_ACCOUNT_VIDEO,
        DATA: body,
      });
      if (response?.status === 200) {
        let newPosts = [...allPost];
        if (response.data?.data?.account?.power !== previousCoinCount) {
          newPosts[index].powerTransferred += 1;
          const post = newPosts[index];
          if (post.power === post.powerTransferred) {
            newPosts = newPosts.filter((_, postIndex) => postIndex !== index);
          }
          setAllPost(newPosts);
        }
        dispatch(
          updateDetails({ power: response?.data?.data?.account?.power })
        );
      }
    }
  };

  return {
    allPost,
    setAllPost,
    totalCount,
    onClickEmpower,
    handleFullWatch,
    getData,
  };
};

export default useEmpower;
