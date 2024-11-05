import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../Layout";

import { privateRoutes } from "./routes";
import { Suspense, useEffect } from "react";
import LoaderSpiner from "components/Loader";
import socketIo from "socketIo";
import { useDispatch, useSelector } from "react-redux";

const PrivateRoute = () => {
  const user = useSelector((state) => state.user?.value);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) socketIo(user?.account?.id.toString(), dispatch);
  }, []);

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
