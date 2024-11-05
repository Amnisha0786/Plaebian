import { lazy } from "react";

const Add = lazy(() => import("../pages/Add"));
const Earn = lazy(() => import("../pages/Earn"));
const Login = lazy(() => import("../pages/Login"));
const Plebeian = lazy(() => import("../pages/Plebeian"));
const Ranks = lazy(() => import("../pages/Ranks"));
const Signup = lazy(() => import("../pages/Signup"));
const Spent = lazy(() => import("../pages/Spent"));
const UserProfile = lazy(() => import("../pages/UserDetail"));
const Titles = lazy(() => import("../pages/Titles"));
const Locations = lazy(() => import("../pages/Locations"));
const EditVideo = lazy(() => import("../pages/EditVideo"));
const Settings = lazy(() => import("../pages/Settings"));
const Notification = lazy(() => import("../pages/Notification"));
const LocationsProfile = lazy(() => import("../pages/LocationsProfile"));
const Tutorials = lazy(() => import("../pages/Tutorials"));
const EditProfile = lazy(() => import("../pages/EditProfile"));
const VideoDetail = lazy(() => import("../pages/VideoDetail"));

export const publicRoutes = [
  {
    path: "/",
    element: <Earn />,
  },
  {
    path: "*",
    element: <Earn />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signUp",
    element: <Signup />,
  },
  {
    path: "/userProfile/:userId",
    element: <UserProfile />,
  },
];

export const privateRoutes = [
  {
    path: "/",
    element: <Earn />,
  },
  {
    path: "/plebeian",
    element: <Plebeian />,
  },
  {
    path: "/userProfile/:userId",
    element: <UserProfile />,
  },

  {
    path: "/add",
    element: <Add />,
  },
  {
    path: "/titles",
    element: <Titles />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/editprofile",
    element: <EditProfile />,
  },
  {
    path: "/locations",
    element: <Locations />,
  },
  {
    path: "/locationProfile",
    element: <LocationsProfile />,
  },
  {
    path: "/video/edit/:id",
    element: <EditVideo />,
  },
  {
    path: "/ranks",
    element: <Ranks />,
  },
  {
    path: "/spent",
    element: <Spent />,
  },
  {
    path: "/tutorials",
    element: <Tutorials />,
  },
  {
    path: "/notification",
    element: <Notification />,
  },
  {
    path: "/videoDetail/:videoId",
    element: <VideoDetail />,
  },
];
