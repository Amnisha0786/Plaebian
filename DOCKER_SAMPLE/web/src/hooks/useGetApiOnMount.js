import { useCallback, useEffect, useState } from "react";

// api
import { getRequest } from "../helper/api";

const apiStatus = {
  loading: "loading",
  complete: "complete",
  errored: "errored",
};

const useGetApiOnMount = (url, params = "") => {
  const [status, setStatus] = useState(apiStatus.loading);
  const [data, setData] = useState(null);

  const getData = useCallback(() => {
    getRequest({ API: params ? `${url}?${params}` : url })
      .then(({ data }) => {
        setData(data);
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
