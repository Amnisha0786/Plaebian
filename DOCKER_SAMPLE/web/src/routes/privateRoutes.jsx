import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../Layout";

import { privateRoutes } from "./routes";
import { Suspense } from "react";
import LoaderSpiner from "components/Loader";

const PrivateRoute = () => {
  return (
    <Suspense fallback={<LoaderSpiner />}>
      <Layout>
        <Routes>
          {privateRoutes.map((route, routeIdx) => (
            <Route path={route.path} key={routeIdx} element={route.element} />
          ))}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Layout>
    </Suspense>
  );
};
export default PrivateRoute;
