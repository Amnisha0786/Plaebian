import { useCallback, useEffect, useState } from "react";

// hooks
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

// api
import { getRequest } from "../helper/api";

// redux
import { logout } from "redux/sharedSlices/user";

const apiStatus = {
  loading: "loading",
  complete: "complete",
  errored: "errored",
};

const useGetApiOnMount = (url, params = "") => {
  const [status, setStatus] = useState(apiStatus.loading);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getData = useCallback(() => {
    getRequest({ API: params ? `${url}?${params}` : url })
      .then((data) => {
        if (data?.success) {
          setData(data?.data);
        } else if (data?.data.status === 401) {
          navigate("/login");
          dispatch(logout());
        }
        setStatus(apiStatus.complete);
      })
      .catch(() => {
        setStatus(apiStatus.errored);
      });
  }, [url, params]);

  useEffect(() => {
    getData();
  }, [getData]);

  return {
    loading: status === apiStatus.loading,
    data,
    errored: status === apiStatus.errored,
    refetch: getData,
  };
};

export default useGetApiOnMount;
