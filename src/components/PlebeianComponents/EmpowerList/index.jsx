// hooks
import { useNavigate } from "react-router-dom";

// images
import PowerCoin from "assets/icons/power-coin.png";

// config
import { IMAGE_URL } from "config";

import styles from "./styles.module.scss";

const EmpowerList = ({ empowerers }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.empower_mains}>
      {empowerers?.map((empowering, index) => {
        return (
          <div
            className={styles.empower_list}
            onClick={() => navigate(`/userProfile/${empowering?.id}`)}
            key={index}
          >
            <div className={styles.list_left}>
              <div className={styles.list_img}>
                <img src={`${IMAGE_URL}${empowering?.pfp}`} alt="pro" />
              </div>
              <div className={styles.list_content}>
                <h6>{`${empowering?.firstName} ${empowering?.lastName}`}</h6>
                <div className={styles.content_botom}>
                  <span>
                    {`${
                      empowering?.city?.name.charAt(0).toUpperCase() +
                      empowering?.city?.name.slice(1)
                    }, ${
                      empowering?.state?.name.charAt(0).toUpperCase() +
                      empowering?.state?.name.slice(1)
                    }`}
                  </span>
                </div>
              </div>
            </div>
            <span className={styles.line}></span>
            <div className={styles.list_right}>
              <div className={styles.content_botom}>
                <span>{"0.1"}</span>
                <img src={PowerCoin} alt="pro" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmpowerList;
