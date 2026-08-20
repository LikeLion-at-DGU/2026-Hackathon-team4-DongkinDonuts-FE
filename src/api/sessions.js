import apiClient from "./client";

export function getActiveSession() {
  return apiClient.get("/sessions/active/");
}

export function startSession({
  routineInstanceId,
  cameraPermissionStatus = "UNKNOWN",
}) {
  return apiClient.post("/sessions/", {
    routine_instance_id: routineInstanceId,
    camera_permission_status: cameraPermissionStatus,
  });
}

export function completeSession(
  sessionId,
  {
    accuracy = 100,
    metrics = null,
  } = {}
) {
  return apiClient.patch(`/sessions/${sessionId}/complete/`, {
    accuracy,
    metrics,
  });
}

export function abortSession(sessionId) {
  return apiClient.patch(`/sessions/${sessionId}/abort/`);
}
