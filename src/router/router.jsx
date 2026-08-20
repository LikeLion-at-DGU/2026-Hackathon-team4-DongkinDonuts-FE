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
                index: true,
                element: <LandingPage key="/" />,
            },

            {
                path: "recovery-session",
                element: (
                    <RecoverySessionStartPage
                        key="/recovery-session"
                    />
                ),
            },

            {
                path: "handroutine",
                element: (
                    <HandRoutinePage
                        key="/handroutine"
                    />
                ),
            },

            {
                path: "breathroutine",
                element: (
                    <BreathRoutinePage
                        key="/breathroutine"
                    />
                ),
            },

            // 눈 깜빡이기
            {
                path: "eye-blink-low",
                element: (
                    <EyeBlinkRoutinePage
                        difficulty="low"
                        key="/eye-blink-low"
                    />
                ),
            },
            {
                path: "eye-blink-medium",
                element: (
                    <EyeBlinkRoutinePage
                        difficulty="medium"
                        key="/eye-blink-medium"
                    />
                ),
            },
            {
                path: "eye-blink-high",
                element: (
                    <EyeBlinkRoutinePage
                        difficulty="high"
                        key="/eye-blink-high"
                    />
                ),
            },

            // 시선 추적
            {
                path: "eye-tracking-low",
                element: (
                    <EyeTrackingRoutinePage
                        difficulty="low"
                        key="/eye-tracking-low"
                    />
                ),
            },
            {
                path: "eye-tracking-medium",
                element: (
                    <EyeTrackingRoutinePage
                        difficulty="medium"
                        key="/eye-tracking-medium"
                    />
                ),
            },
            {
                path: "eye-tracking-high",
                element: (
                    <EyeTrackingRoutinePage
                        difficulty="high"
                        key="/eye-tracking-high"
                    />
                ),
            },

            // 목 스트레칭
            {
                path: "neck-stretch-low",
                element: (
                    <NeckStretchRoutinePage
                        difficulty="low"
                        key="/neck-stretch-low"
                    />
                ),
            },
            {
                path: "neck-stretch-medium",
                element: (
                    <NeckStretchRoutinePage
                        difficulty="medium"
                        key="/neck-stretch-medium"
                    />
                ),
            },
            {
                path: "neck-stretch-high",
                element: (
                    <NeckStretchRoutinePage
                        difficulty="high"
                        key="/neck-stretch-high"
                    />
                ),
            },

            // 어깨 PMR
            {
                path: "shoulder-pmr-low",
                element: (
                    <ShoulderPmrRoutinePage
                        difficulty="low"
                        key="/shoulder-pmr-low"
                    />
                ),
            },
            {
                path: "shoulder-pmr-medium",
                element: (
                    <ShoulderPmrRoutinePage
                        difficulty="medium"
                        key="/shoulder-pmr-medium"
                    />
                ),
            },
            {
                path: "shoulder-pmr-high",
                element: (
                    <ShoulderPmrRoutinePage
                        difficulty="high"
                        key="/shoulder-pmr-high"
                    />
                ),
            },

            // 집중 핀치
            {
                path: "focus-pinch-low",
                element: (
                    <FocusPinchRoutinePage
                        difficulty="low"
                        key="/focus-pinch-low"
                    />
                ),
            },
            {
                path: "focus-pinch-medium",
                element: (
                    <FocusPinchRoutinePage
                        difficulty="medium"
                        key="/focus-pinch-medium"
                    />
                ),
            },
            {
                path: "focus-pinch-high",
                element: (
                    <FocusPinchRoutinePage
                        difficulty="high"
                        key="/focus-pinch-high"
                    />
                ),
            },

            // Sunrise
            {
                path: "wakeup-sunrise-low",
                element: (
                    <SunriseRoutinePage
                        difficulty="low"
                        key="/wakeup-sunrise-low"
                    />
                ),
            },
            {
                path: "wakeup-sunrise-medium",
                element: (
                    <SunriseRoutinePage
                        difficulty="medium"
                        key="/wakeup-sunrise-medium"
                    />
                ),
            },
            {
                path: "wakeup-sunrise-high",
                element: (
                    <SunriseRoutinePage
                        difficulty="high"
                        key="/wakeup-sunrise-high"
                    />
                ),
            },

            {
                path: "settings",
                element: <SettingsPage />,
            },
        ],
    },
]);

export default router;