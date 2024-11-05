import React from "react";

//icons
import { ReactComponent as Cancel } from "assets/icons/cancel.svg";

//styles
import styles from "./styles.module.scss";

//components
import HomeHeader from "components/HomeHeader";

const CancelPayment = () => {
  return (
    <>
      <HomeHeader text="PAYMENT CANCELLED" className={styles.font20} />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.common}>
            <Cancel />
            <h3 className={styles.failed}>OOPS! Something Went Wrong</h3>
            <p>
              Payment cancelled due to some reason . You may go back to home or
              try again later for better response !
            </p>
            <a href="/" className={styles.back}>
              Go To Homepage
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default CancelPayment;
