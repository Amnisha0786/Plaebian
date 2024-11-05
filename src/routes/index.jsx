// library components
import { useSelector } from "react-redux";

// custom components
import PublicRoutes from "./publicRoutes";
import PrivateRoute from "./privateRoutes";
import { updateAuthToken } from "../helper/api";

const AppRoutes = () => {
  const isLogin = useSelector((state) => state.user?.value?.token);
  updateAuthToken(isLogin);
  return <>{isLogin ? <PrivateRoute /> : <PublicRoutes />}</>;
};

export default AppRoutes;
