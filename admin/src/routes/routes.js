import Login from "../pages/Login";
import Home from "../pages/Home";
import Add from "../pages/Add";

export const publicRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
];

export const privateRoutes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/add-video",
    element: <Add />,
  },
];
