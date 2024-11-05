// hooks
import { useNavigate } from "react-router-dom";

// custom components
import TitleIcon from "components/TitleIcon";

// images
import PowerCoin from "assets/icons/power-coin.png";

// utils
import { getTitle } from "common/utils";

// config
import { IMAGE_URL } from "config";

const EmpowerList = ({ empowerers }) => {
  const navigate = useNavigate();

  return (
    <div className="empower_mains">
      {empowerers?.map((empowering, index) => {
        const title = getTitle(empowering?.followerCount);
        return (
          <div
            className="empower_list"
            onClick={() => navigate(`/userProfile/${empowering?.id}`)}
            key={index}
          >
            <div className="list_left">
              <div className="list_img">
                <img src={`${IMAGE_URL}${empowering?.pfp}`} alt="pro" />
              </div>
              <div className="list_content">
                <h6>{`${empowering?.firstName} ${empowering?.lastName}`}</h6>
                <div className="content_botom">
                  <TitleIcon title={title} />

                  <span>{title}</span>
                </div>
              </div>
            </div>
            <span className="line"></span>
            <div className="list_right">
              <div className="content_botom">
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
