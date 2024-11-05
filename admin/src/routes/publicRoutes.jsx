import { Routes, Route, Navigate } from "react-router-dom";
// import Layout from "../Layout";

import { publicRoutes } from "./routes";

const PublicRoutes = () => {
  return (
    // <Layout>
      <Routes>
        {publicRoutes.map((route, routeIdx) => (
          <Route path={route.path} key={routeIdx} element={route.element} />
        ))}
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    // </Layout>
  );
};
export default PublicRoutes;
