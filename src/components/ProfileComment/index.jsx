import { useCallback, useMemo, useState } from "react";

// Library components
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// hooks
import { useDispatch } from "react-redux";
import useGetApiOnMount from "hooks/useGetApiOnMount";

// custom component
import ConfirmDeleteCommentModal from "../EarnComponents/ConfirmDeleteCommentModal";

// api
import { API_END_POINTS } from "common/apiConstants";
import { deleteRequest } from "helper/api";

// asset
import { ReactComponent as VideosLight } from "assets/icons/videos-icon-light.svg";
import { ReactComponent as Deletes } from "assets/icons/trash-can-regular.svg";
import { ReactComponent as EarnLight } from "assets/icons/earn-light.svg";

// redux
import { logout } from "redux/sharedSlices/user";

import styles from "./styles.module.scss";

const ProfileComment = () => {
  const [deleteComment, setDeleteComment] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, refetch } = useGetApiOnMount(
    API_END_POINTS.GET_COMMENTS_PROFILE
  );
  const navigation = useNavigate();

  const commentList = useMemo(() => {
    return data || [];
  }, [data]);

  const onDelete = useCallback(async () => {
    try {
      const response = await deleteRequest({
        API: `comment/${deleteComment}`,
      });
      if (response?.success) {
        setDeleteComment("");
        refetch();
      } else if (response?.status === 401) {
        navigate("/login");
        dispatch(logout());
      } else {
        toast(response?.data || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong !");
    }
  }, [deleteComment]);

  return (
    <>
      <div className={`${styles.noti_box} ${styles.commemtsSection}`}>
        <h4 className={styles.commentsPlabein}> Comments</h4>

        {commentList?.length > 0 &&
          commentList.map((item) => {
            const earning =
              parseInt(item?.empower_power || 0) -
              (-parseInt(item?.empower_power || 0) + item?.comment_power);
            return (
              <div className={styles.noti_contents} key={item.comment_id}>
                <div className={styles.delet_icon}>
                  <p>{item?.comment_description}</p>
                  <span>
                    {/* onClick={() => openModalDelete(post)} */}
                    <Deletes
                      onClick={() => setDeleteComment(item?.comment_id)}
                    />
                  </span>
                </div>

                <div className={styles.commentsCount}>
                  <ul>
                    <li
                      className={
                        earning < 0
                          ? `${styles.red}`
                          : earning > 0
                          ? `${styles.green}`
                          : `${styles.black}`
                      }
                    >
                      <EarnLight />
                      <span>{earning}</span>
                    </li>
                    <li>
                      <VideosLight
                        onClick={() =>
                          navigation(`/videoDetail/${item?.comment_videoId}`)
                        }
                      />
                    </li>
                  </ul>
                </div>
                <ConfirmDeleteCommentModal
                  showModal={deleteComment}
                  handleCloseModalDelete={() => setDeleteComment("")}
                  handleDeleteConfirm={() => onDelete()}
                />
              </div>
            );
          })}
      </div>
    </>
  );
};

export default ProfileComment;
