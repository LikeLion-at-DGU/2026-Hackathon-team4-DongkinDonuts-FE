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
import SettingsPage from "../pages/SettingsPage";
import RecoverySessionStartPage from "../pages/RecoverySessionStartPage";

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
        path: "/recovery-session",
        element: <RecoverySessionStartPage key="/recovery-session" />,
      },
      {
        path: "/handroutine",
        element: <HandRoutinePage key="/handroutine" />
      },
      {
        path: "/breathroutine",
        element: <BreathRoutinePage key="/breathroutine" />
      },
      // 세션마다 난이도(low/medium/high)별로 페이지 id 자체가 다른 경로를 갖는다
      // (예: /eye-blink-low, /eye-blink-medium, /eye-blink-high). 같은 컴포넌트를
      // difficulty prop만 다르게 주입해 재사용하며, 새 페이지를 만들지는 않는다.
      {
        path: "/eye-blink-low",
        element: <EyeBlinkRoutinePage difficulty="low" key="/eye-blink-low" />,
      },
      {
        path: "/eye-blink-medium",
        element: <EyeBlinkRoutinePage difficulty="medium" key="/eye-blink-medium" />,
      },
      {
        path: "/eye-blink-high",
        element: <EyeBlinkRoutinePage difficulty="high" key="/eye-blink-high" />,
      },
      {
        path: "/eye-tracking-low",
        element: <EyeTrackingRoutinePage difficulty="low" key="/eye-tracking-low" />,
      },
      {
        path: "/eye-tracking-medium",
        element: <EyeTrackingRoutinePage difficulty="medium" key="/eye-tracking-medium" />,
      },
      {
        path: "/eye-tracking-high",
        element: <EyeTrackingRoutinePage difficulty="high" key="/eye-tracking-high" />,
      },
      {
        path: "/neck-stretch-low",
        element: <NeckStretchRoutinePage difficulty="low" key="/neck-stretch-low" />,
      },
      {
        path: "/neck-stretch-medium",
        element: <NeckStretchRoutinePage difficulty="medium" key="/neck-stretch-medium" />,
      },
      {
        path: "/neck-stretch-high",
        element: <NeckStretchRoutinePage difficulty="high" key="/neck-stretch-high" />,
      },
      {
        path: "/shoulder-pmr-low",
        element: <ShoulderPmrRoutinePage difficulty="low" key="/shoulder-pmr-low" />,
      },
      {
        path: "/shoulder-pmr-medium",
        element: <ShoulderPmrRoutinePage difficulty="medium" key="/shoulder-pmr-medium" />,
      },
      {
        path: "/shoulder-pmr-high",
        element: <ShoulderPmrRoutinePage difficulty="high" key="/shoulder-pmr-high" />,
      },
      {
        path: "/focus-pinch-low",
        element: <FocusPinchRoutinePage difficulty="low" key="/focus-pinch-low" />,
      },
      {
        path: "/focus-pinch-medium",
        element: <FocusPinchRoutinePage difficulty="medium" key="/focus-pinch-medium" />,
      },
      {
        path: "/focus-pinch-high",
        element: <FocusPinchRoutinePage difficulty="high" key="/focus-pinch-high" />,
      },
      {
        path: "/wakeup-sunrise-low",
        element: <SunriseRoutinePage difficulty="low" key="/wakeup-sunrise-low" />,
      },
      {
        path: "/wakeup-sunrise-medium",
        element: <SunriseRoutinePage difficulty="medium" key="/wakeup-sunrise-medium" />,
      },
      {
        path: "/wakeup-sunrise-high",
        element: <SunriseRoutinePage difficulty="high" key="/wakeup-sunrise-high" />,
      },
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
    ],
  },
]);

export default router;
