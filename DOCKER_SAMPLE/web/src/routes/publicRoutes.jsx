import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../Layout";
import { publicRoutes } from "./routes";
import LoaderSpiner from "components/Loader";
import { Suspense } from "react";

const PublicRoutes = () => {
  return (
    <Suspense fallback={<LoaderSpiner />}>
      <Layout>
        <Routes>
          {publicRoutes.map((route, routeIdx) => (
            <Route path={route.path} key={routeIdx} element={route.element} />
          ))}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Layout>
    </Suspense>
  );
};
export default PublicRoutes;
