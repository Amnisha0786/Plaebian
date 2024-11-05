import { useCallback, useMemo, useState } from "react";

// Library components
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// custom hooks
import useGetApiOnMount from "hooks/useGetApiOnMount";

// custom component
import ConfirmDeleteCommentModal from "../EarnComponents/ConfirmDeleteCommentModal";

// api
import { API_END_POINTS } from "common/apiConstants";
import { deleteRequest } from "helper/api";
import { API_URL } from "../../config";

// asset
import { ReactComponent as VideosLight } from "assets/icons/videos-icon-light.svg";
import { ReactComponent as Deletes } from "assets/icons/trash-can-regular.svg";
import { ReactComponent as EarnLight } from "assets/icons/earn-light.svg";

const ProfileComment = () => {
  const [deleteComment, setDeleteComment] = useState("");

  const { data, refetch } = useGetApiOnMount(
    API_END_POINTS.GET_COMMENTS_PROFILE
  );
  const navigation = useNavigate();

  const commentList = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const onDelete = useCallback(async () => {
    const response = await deleteRequest({
      API: `${API_URL}comment/${deleteComment}`,
    });
    if (response?.status) {
      setDeleteComment("");
    } else {
      toast(response?.data || "Something went wrong");
    }
    refetch();
  }, [deleteComment]);

  return (
    <>
      <div className="noti-box commemtsSection">
        <h4 className="commentsPlabein"> Comments</h4>

        {commentList?.length > 0 &&
          commentList.map((item) => {
            const earning =
              parseInt(item?.empower_power || 0) -
              (-parseInt(item?.empower_power || 0) + item?.comment_power);
            return (
              <div className="noti-contents">
                <div className="delet-icon">
                  <p>{item?.comment_description}</p>
                  <span>
                    {/* onClick={() => openModalDelete(post)} */}
                    <Deletes
                      onClick={() => setDeleteComment(item?.comment_id)}
                    />
                  </span>
                </div>

                <div className="commentsCount">
                  <ul>
                    <li
                      className={
                        earning < 0 ? "red" : earning > 0 ? "green" : "black"
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
