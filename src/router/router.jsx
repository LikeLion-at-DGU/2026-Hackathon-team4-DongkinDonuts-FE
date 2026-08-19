import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LandingPage from "../pages/LandingPage";
import HandRoutinePage from "../pages/HandRoutinePage";
import BreathRoutinePage from "../pages/BreathRoutinePage";
import EyeBlinkRoutinePage from "../pages/EyeBlinkRoutinePage";
import EyeTrackingRoutinePage from "../pages/EyeTrackingRoutinePage";
import NeckStretchRoutinePage from "../pages/NeckStretchRoutinePage";
import ShoulderPmrRoutinePage from "../pages/ShoulderPmrRoutinePage";
import FocusPinchRoutinePage from "../pages/FocusPinchRoutinePage";
import DrowsyIceRoutinePage from "../pages/DrowsyIceRoutinePage";

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
      {
        path: "/eye-blink",
        element: <EyeBlinkRoutinePage />,
      },
      {
        path: "/eye-tracking",
        element: <EyeTrackingRoutinePage />,
      },
      {
        path: "/neck-stretch",
        element: <NeckStretchRoutinePage />,
      },
      {
        path: "/shoulder-pmr",
        element: <ShoulderPmrRoutinePage />,
      },
      {
        path: "/focus-pinch",
        element: <FocusPinchRoutinePage />,
      },
      {
        path: "/drowsy-ice",
        element: <DrowsyIceRoutinePage />,
      },
    ],
  },
]);

export default router;
