import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LandingPage from "../pages/LandingPage";
import HandRoutinePage from "../pages/HandRoutinePage";
import BreathRoutinePage from "../pages/BreathRoutinePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/handroutine",
        element: <HandRoutinePage />
      },
      {
        path: "/breathroutine",
        element: <BreathRoutinePage />
      },
    ],
  },
]);

export default router;
