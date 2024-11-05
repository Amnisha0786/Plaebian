import { useSelector } from "react-redux";

const useAuthentication = () => {
  const isAuthenticate = useSelector((state) => state.user.value.token);

  return { isAuthenticate, redirectToLogin: "/login" };
};
export default useAuthentication;
