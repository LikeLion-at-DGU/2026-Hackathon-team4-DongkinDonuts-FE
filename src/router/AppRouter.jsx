import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import TeamPage from "../pages/TeamPage";
import ProjectPage from "../pages/ProjectPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/project" element={<ProjectPage />} />
    </Routes>
  );
}

export default AppRouter;