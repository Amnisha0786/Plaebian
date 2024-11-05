import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// components
import { addAcountToStripe, formatNumberWithOneDecimal } from "common/utils";
import HomeHeader from "components/HomeHeader";
import LoaderSpiner from "components/Loader";

// styles
import styles from "./styles.module.scss";

// assets
import { ReactComponent as PowerCoin } from "assets/icons/power-coin-dark.svg";

//api
import { getRequest, postRequest } from "helper/api";
import { API_END_POINTS } from "common/apiConstants";

//toastify
import { toast } from "react-toastify";

//hooks
import useGetProfile from "hooks/useGetProfile";

const CoinBank = () => {
  const [inputValue, setInputValue] = useState("");
  const [coinPrice, setCoinPrice] = useState(0);
  const [cashIn, setCashIn] = useState(true);
  const [cashOut, setCashOut] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(0);
  const [cashInCoins, setCashInCoin] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const user = useSelector((state) => state.user?.value);
  const navigate = useNavigate();
  const profile = useGetProfile();

  const getCashInPrice = async () => {
    setLoading(true);
    try {
      const response = await getRequest({
        API: `${API_END_POINTS.GET_CASH_IN_PRICE}`,
      });
      if (response?.success) {
        setCoinPrice(parseFloat(response?.data?.price).toFixed(3));
        setCashInCoin(parseFloat(response?.data?.appCoins));
        setLimit(Math.ceil(1 / response?.data?.price));
      }
    } catch (err) {
      toast.error(
        err?.data?.error?.code || err?.data?.message || "Something went wrong"
      );
    }
    setLoading(false);
  };

  const getCashOutPrice = async () => {
    setLoading(true);
    try {
      const response = await getRequest({
        API: `${API_END_POINTS.GET_CASH_OUT_PRICE}`,
      });
      if (response?.success) {
        setCoinPrice(parseFloat(response.data.price).toFixed(3));
        setLimit(Math.ceil(1 / response?.data?.price));
      }
    } catch (err) {
      toast.error(
        err?.data?.error?.code || err?.data?.message || "Something went wrong"
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (cashIn) {
      getCashInPrice();
    } else {
      getCashOutPrice();
    }
  }, [cashIn]);

  const handleOpen = (cashout) => {
    setInputValue();
    setError("");
    if (cashout) {
      setCashOut(true);
      setCashIn(false);
    } else {
      setCashIn(true);
      setCashOut(false);
    }
  };

  const handleCashInSubmit = async () => {
    setProcessing(true);
    try {
      const currentValue = parseFloat(inputValue) || 0;

      if (currentValue > cashInCoins) {
        setError(`Cash-in coins should be less than ${cashInCoins}`);
      } else if (currentValue === 0) {
        setError(`Please add Coins to Cash-in`);
      } else if (currentValue < limit) {
        setError(`Minimum coins should be > or = ${limit}`);
      } else {
        const body = {
          price: currentValue * coinPrice,
          userId: user.account.id || 0,
          coins: currentValue,
        };
        const response = await postRequest({
          API: `${API_END_POINTS.CASH_IN_PAYMENT}`,
          DATA: body,
        });
        if (response?.success) {
          window.location = response?.data?.session?.url;
        } else {
          toast(response?.data?.error?.code || "Something went wrong");
        }
      }
    } catch (error) {
      toast.error(error?.data?.error?.code || "Invalid amount");
    }
    setProcessing(false);
  };

  const dashboardPage = async () => {
    setProcessing(true);
    if (user.account.stripe_account != null) {
      try {
        const response = await getRequest({
          API: `${API_END_POINTS.STRIPE_DASHBOARD_LINK}/${
            user.account.stripe_account || ""
          }`,
        });
        if (response?.data?.url) {
          window.location.href = response.data.url;
        }
      } catch (error) {
        toast.error(error || "Something went wrong");
      }
    }
    setProcessing(false);
  };

  const handleCashOutSubmit = async () => {
    if (user?.account?.stripe_account) {
      setProcessing(true);
      try {
        const currentValue = parseFloat(inputValue) || 0;
        if (currentValue > parseFloat(user?.account?.power)) {
          setError("Insufficient power");
        } else if (currentValue < limit) {
          setError(`Minimum coins should be > or = ${limit} `);
        } else {
          const appCoins = cashInCoins + currentValue;
          const amount =
            formatNumberWithOneDecimal(currentValue * coinPrice) * 100;
          const body = {
            stripeAccountId: profile?.stripe_account || 0,
            amount: amount,
            coins: appCoins,
            cashOut: currentValue,
            userId: user?.account?.id || 0,
          };
          const response = await postRequest({
            API: `${API_END_POINTS.CASH_OUT_PAY}`,
            DATA: body,
          });
          if (response?.success) {
            toast.success(
              `Payment Successfull , Congrats! You recieved ${
                response.data.amount / 100
              } `
            );
            dashboardPage();
            // navigate("/settings");
          }
        }
      } catch (err) {
        toast.error(
          `${err?.data?.error?.code} You may go to settings/dashboard or try again later` ||
            "You may go to settings/dashboard or try again later"
        );
        if (
          err?.data?.error?.code === "insufficient_capabilities_for_transfer"
        ) {
          addAcountToStripe(user, setProcessing);
          toast.error("Please add your bank details");
        }
      }
      setProcessing(false);
    } else {
      toast.error("You need to add your stripe account ...");
      navigate("/settings");
    }
  };

  const handlechange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setError("");
  };

  if (loading) {
    return <LoaderSpiner />;
  }

  return (
    <>
      <HomeHeader text="Coin Bank" className={styles.textColor} />
      <div className={styles.container}>
        <div className={styles.button_group}>
          <button
            className={`${cashIn ? styles.active : styles.cash}`}
            onClick={() => handleOpen(false)}
          >
            Cash In
          </button>
          <button
            className={` ${cashOut ? styles.active : styles.cash}`}
            onClick={() => handleOpen(true)}
          >
            Cash Out
          </button>
        </div>

        <div className={styles.headings}>
          <div className={styles.upper_content}>
            <div className={`${styles.content}`}>
              <h3>Single Coin Price :</h3> <span>${coinPrice || 0}</span>
            </div>
            <div className={`${styles.content}`}>
              <h3>Available Coins : </h3>{" "}
              <span className={styles.coins}>
                <PowerCoin />
                {user.account.power || 0}
              </span>
            </div>
          </div>
          <div className={styles.lower_content}>
            {cashIn && (
              <>
                <div className={styles.warnings}>
                  <ul>
                    <span>NOTE : </span>
                    <li>
                      {" "}
                      Minimum cashin coins should be greater than or equal to{" "}
                      {limit}{" "}
                    </li>
                    <li>
                      {" "}
                      Maximum cashin coins should be less than or equal to{" "}
                      {cashInCoins}
                    </li>
                  </ul>
                </div>
                <div className={`${styles.content} ${styles.cash_out_box}`}>
                  <h3>Coins to cash in :</h3>
                  <div className="span">
                    <label>
                      <PowerCoin />
                    </label>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={handlechange}
                      className={styles.inputText}
                    />
                  </div>
                </div>
                {error && <p className={styles.err}>! {error}</p>}

                <div className={`${styles.inner_content} ${styles.content}`}>
                  <button
                    className={styles.submitBtn}
                    onClick={handleCashInSubmit}
                    disabled={processing}
                  >
                    {processing && (
                      <div class="spinner-containers">
                        <div class="spinners spin_margin"></div>
                      </div>
                    )}
                    Submit
                  </button>
                </div>
              </>
            )}

            {cashOut && (
              <>
                <div className={styles.warnings}>
                  <ul>
                    <span>NOTE : </span>
                    <li>
                      {" "}
                      Minimum cashout coins should be greater than or equal to{" "}
                      {limit}{" "}
                    </li>
                    <li>
                      For any transaction details you can go to{" "}
                      <a href="/settings"> Stripe dashboard</a>.
                    </li>
                  </ul>
                </div>
                <div className={`${styles.content} ${styles.cash_in_box}`}>
                  <h3>Coins to cash out :</h3>
                  <div>
                    <label>
                      <PowerCoin />
                    </label>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={handlechange}
                      className={styles.inputText}
                    />
                  </div>
                </div>
                {error && <p className={styles.err}>! {error}</p>}

                <div className={`${styles.inner_content} ${styles.content}`}>
                  <button
                    className={styles.submitBtn}
                    onClick={handleCashOutSubmit}
                    disabled={processing}
                  >
                    {processing && (
                      <div class="spinner-containers">
                        <div class="spinners spin_margin"></div>
                      </div>
                    )}
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default CoinBank;
