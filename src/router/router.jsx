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
import SunriseRoutinePage from "../pages/SunriseRoutinePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LandingPage key="/" />,
      },
      {
        path: "/handroutine",
        element: <HandRoutinePage key="/handroutine" />
      },
      {
        path: "/breathroutine",
        element: <BreathRoutinePage key="/breathroutine" />
      },
      {
        path: "/eye-blink",
        element: <EyeBlinkRoutinePage key="/eye-blink" />,
      },
      {
        path: "/eye-tracking",
        element: <EyeTrackingRoutinePage key="/eye-tracking" />,
      },
      {
        path: "/neck-stretch",
        element: <NeckStretchRoutinePage key="/neck-stretch" />,
      },
      {
        path: "/shoulder-pmr",
        element: <ShoulderPmrRoutinePage key="/shoulder-pmr" />,
      },
      {
        path: "/focus-pinch",
        element: <FocusPinchRoutinePage key="/focus-pinch" />,
      },
      {
        path: "/wakeup-sunrise",
        element: <SunriseRoutinePage key="/wakeup-sunrise" />,
      },
    ],
  },
]);

export default router;
