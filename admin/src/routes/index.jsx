// library components
import { useSelector } from "react-redux";

// custom components
import PublicRoutes from "./publicRoutes";
import PrivateRoute from "./privateRoutes";
import { useEffect } from "react";
import { updateAuthToken } from "src/api/axios";

const AppRoutes = () => {
  const isLogin = useSelector((state) => state?.user?.value?.token);
  useEffect(()=>{
    if(isLogin){
      updateAuthToken(isLogin)
    }
  },[isLogin])
  return <>{isLogin ? <PrivateRoute /> : <PublicRoutes />}</>;
};

export default AppRoutes;
