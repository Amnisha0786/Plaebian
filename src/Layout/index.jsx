// Library components
import { Outlet } from "react-router-dom";

// Custom components
import Footer from "components/Footer";

const Layout = ({ children }) => {
  return (
    <>
      <Outlet />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
