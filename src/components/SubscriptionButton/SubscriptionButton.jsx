import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// styles
import styles from "./styles.module.scss";

// api
import { deleteRequest, postRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

// redux
import { useSelector } from "react-redux";

// toastify
import { toast } from "react-toastify";

// hooks
import useGetProfile from "hooks/useGetProfile";

// components
import LoaderSpiner from "components/Loader";

// icons
import { ReactComponent as SubsciptionTick } from "assets/icons/subscribedTick.svg";

function SubscriptionButton() {
  const [subscriptionDetails, setSubscriptionDetails] = useState();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.user?.value);
  const navigate = useNavigate();
  const profile = useGetProfile();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!user?.token) {
        navigate("/login");
        return toast("You have to login for subscription");
      }
      let body = {};
      let url = "";
      body["userId"] = user?.account?.id || 0;
      url = `${API_END_POINTS.SUBSCRIPTION}`;
      const response = await postRequest({ API: url, DATA: body });
      if (response?.success) {
        setSubscriptionDetails(response?.data?.session);
        window.location = response?.data?.session?.url;
      } else {
        toast(response?.message || "Something went wrong");
      }
    } catch (err) {
      console.log(err, "errorr");
      toast(err?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleUnsubscribed = async () => {
    setLoading(true);
    try {
      const res = await deleteRequest({
        API: `account/unsubscribe/${user?.account?.id || 0}/${
          profile?.subscription
        }`,
      });
      if (res?.status === 200) {
        setSuccess(false);
        toast.success("Unsubscribed succcessfully.");
      }
    } catch (err) {
      console.log(err, "errorr");
      toast(err?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      setSuccess(profile.subscription_success);
    }
  }, [profile]);

  if (loading || profile?.subscription_success === undefined) {
    return <LoaderSpiner />;
  }

  return (
    <div className={styles.flex_group}>
      {success ? (
        <button
          className={styles.subscribedBtn}
          onClick={handleUnsubscribed}
          disabled={loading}
        >
          <SubsciptionTick /> Unsubscribe
        </button>
      ) : (
        <button
          className={styles.subscribeBtn}
          onClick={handleSubmit}
          disabled={loading}
        >
          Subscribe Now ?
        </button>
      )}
    </div>
  );
}

export default SubscriptionButton;
