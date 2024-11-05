import { useState } from "react";

// library utils
import { toast } from "react-toastify";

// api
import { putRequest } from "../helper/api";

const apiStatus = {
  loading: "loading",
  complete: "complete",
  errored: "errored",
};

const usePutRequest = () => {
  const [status, setStatus] = useState("");

  const trigger = async (
    url = "",
    body = {},
    successCallback = () => {},
    failureCallback = () => {},
    headers = {},
    successMessage = "",
    failureMessage = "",
    showSuccessToast = true,
    showErrorToast = true
  ) => {
    try {
      setStatus(apiStatus.loading);
      const response = await putRequest({
        API: url,
        DATA: body,
        HEADER: headers,
      });
      if (response?.success) {
        setStatus(apiStatus.complete);
        if (showSuccessToast) {
          toast(
            successMessage || response?.message || "Success !",
            {
              type: "success",
            }
          );
        }
        successCallback(response?.data);
      }
    } catch (error) {
      setStatus(apiStatus.errored);
      if (showErrorToast) {
        toast(
          failureMessage || error?.data?.message || "Something went wrong",
          {
            type: "error",
          }
        );
      }
      failureCallback(error?.data?.message);
    }
  };

  return {
    loading: status === apiStatus.loading,
    errored: status === apiStatus.errored,
    trigger,
  };
};

export default usePutRequest;
