import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import ReactDOM from "react-dom/client";

import "./index.css";

import {
  TopicPage,
  RoadmapPage,
  QuizPage,
  ProfilePage,
} from "./pages/index";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProfilePage />,
  },

  {
    path: "/profile",
    element: <ProfilePage />,
  },

  {
    path: "/test",
    element: <App />,
  },

  {
    path: "/roadmap",
    element: <RoadmapPage />,
  },

  {
    path: "/quiz",
    element: <QuizPage />,
  },

  {
    path: "/topic",
    element: <TopicPage />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();