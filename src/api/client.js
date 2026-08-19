import axios from "axios";

const DEVICE_CODE_STORAGE_KEY = "brainfit_device_code";

// 로그인이 없는 서비스라, 브라우저마다 UUID 하나를 만들어 X-Device-Code 헤더로
// 보낸다(백엔드 DeviceCodeAuthentication이 이 값을 그대로 User.id로 씀).
// 최초 1회만 생성하고 이후엔 localStorage에 저장된 값을 재사용한다.
function getDeviceCode() {
  let code = localStorage.getItem(DEVICE_CODE_STORAGE_KEY);
  if (!code) {
    code = crypto.randomUUID();
    localStorage.setItem(DEVICE_CODE_STORAGE_KEY, code);
  }
  return code;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.dgu14thlikelion.shop/api/v1",
});

apiClient.interceptors.request.use((config) => {
  const deviceCode = getDeviceCode();

  config.headers["X-Device-Code"] = deviceCode;

  console.log("요청 URL:", config.baseURL + config.url);
  console.log("X-Device-Code:", deviceCode);

  return config;
});

// 백엔드 EnvelopeMixin이 항상 {success, data, message} 형태로 감싸서 내려주므로,
// 여기서 한 번에 풀어서 실제 값(data)만 반환한다. success=false면 에러로 처리.
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "success" in response.data) {
      if (!response.data.success) {
        return Promise.reject(response.data.error ?? response.data);
      }
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    const envelope = error.response?.data;
    if (envelope?.error) {
      return Promise.reject(envelope.error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { getDeviceCode };
