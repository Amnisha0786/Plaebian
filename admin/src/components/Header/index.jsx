// library components
import { Link, useNavigate } from "react-router-dom";

// redux
import { useDispatch } from "react-redux";
import { addDetails } from "src/redux/sharedSlices/user";

// styles
import "./styles.scss";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onClickLogout = async () => {
    dispatch(addDetails({}));
    navigate("/login");
  };

  return (
    <div className="admin_header">
      <header>
        <nav>
          <h2>Plebeian Admin</h2>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/add-video">Add Video</Link>
            </li>
            <li className="logout" onClick={onClickLogout}>
              Logout
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Header;
