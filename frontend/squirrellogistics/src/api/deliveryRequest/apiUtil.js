export function getAuthHeaders() {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function buildConfig(options = {}) {
  const { signal, headers: extraHeaders, ...rest } = options;
  return {
    signal,
    headers: { ...getAuthHeaders(), ...(extraHeaders || {}) },
    ...rest,
  };
};