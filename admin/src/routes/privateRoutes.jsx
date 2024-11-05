import { Routes, Route, Navigate } from "react-router-dom";
// import Layout from "../Layout";

import { privateRoutes } from "./routes";

const PrivateRoute = () => {
  return (
    // <Layout>
      <Routes>
        {privateRoutes.map((route, routeIdx) => (
          <Route path={route.path} key={routeIdx} element={route.element} />
        ))}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    // </Layout>
  );
};
export default PrivateRoute;
