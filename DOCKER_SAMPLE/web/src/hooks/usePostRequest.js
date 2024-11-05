import { useState } from "react";

// api
import { postRequest } from "../helper/api";

// library utils
import { toast } from "react-toastify";

const apiStatus = {
  loading: "loading",
  complete: "complete",
  errored: "errored",
};

const usePostRequest = () => {
  const [status, setStatus] = useState("");

  const trigger = async (
    url = "",
    body = {},
    successCallback = () => {},
    failureCallback = () => {},
    successMessage = "",
    failureMessage = "",
    showSuccessToast = true,
    showErrorToast = true
  ) => {
    try {
      setStatus(apiStatus.loading);
      const response = await postRequest({
        API: url,
        DATA: body,
      });
      if (response?.status === 200) {
        setStatus(apiStatus.complete);
        if (showSuccessToast) {
          toast(
            successMessage || response?.data?.message || "Something went wrong",
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

export default usePostRequest;
