import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// icons
import { ReactComponent as Success } from "assets/icons/succes.svg";
import { ReactComponent as PowerCoin } from "assets/icons/power-coin-dark.svg";

// styles
import styles from "./styles.module.scss";

// api
import { API_END_POINTS } from "common/apiConstants";
import { postRequest } from "helper/api";

// toastify
import { toast } from "react-toastify";

// components
import HomeHeader from "components/HomeHeader";
import LoaderSpiner from "components/Loader";

// hooks
import useGetProfile from "hooks/useGetProfile";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const profile = useGetProfile();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cashInSuccess, setCashInSuccess] = useState(false);

  const handleSuccess = async () => {
    setLoading(true);
    try {
      const body = {
        userId: profile?.id || 0,
        sessionId: profile.cashin_success || " ",
      };
      const response = await postRequest({
        API: `${API_END_POINTS.PAYMENT_SUCCESS}`,
        DATA: body,
      });
      if (response?.success) {
        setPaymentSuccess(true);
      } else {
        navigate("/cancel");
        toast.error(response?.data || "Something went wrong");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile?.subscription) {
      handleSuccess();
    } else if (
      profile &&
      profile?.cashin_success != null &&
      profile?.cashin_coins !== 0
    ) {
      handleCashInSuccess();
    }
  }, [profile]);

  const handleCashInSuccess = async () => {
    setLoading(true);
    try {
      const body = {
        userId: profile?.id || 0,
        sessionId: profile.cashin_success || " ",
        coins: profile.cashin_coins,
      };
      const response = await postRequest({
        API: `${API_END_POINTS.CASH_IN_SUCCESS}`,
        DATA: body,
      });
      if (response?.success) {
        setCashInSuccess(true);
      } else {
        navigate("/cancel");
        toast.error(response?.data || "Something went wrong");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handlePaymentSuccess = async () => {
    if (paymentSuccess) {
      navigate("/settings");
    } else if (cashInSuccess) {
      navigate("/plebeian");
    } else {
      toast.error("Something went wrong please wait or try again later");
    }
  };

  if (loading) {
    return <LoaderSpiner />;
  }

  return (
    <>
      <HomeHeader text="PAYMENT SUCCESSFUL" className={styles.font_20} />
      <div className={styles.common}>
        <div className={styles.content}>
          <div className={styles.main}>
            <Success />
            <h3 className={styles.pay}>Payment Successful!</h3>
            {cashInSuccess && (
              <p className={styles.cashInPara}>
                CONTRATS! You recieved <PowerCoin /> {profile.cashin_coins}{" "}
                coins
              </p>
            )}
            <p>
              Your Payment Done Successfully, Please click proceed for
              further...{" "}
            </p>
            <button
              onClick={() => handlePaymentSuccess()}
              className={styles.btn}
              disabled={loading}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
