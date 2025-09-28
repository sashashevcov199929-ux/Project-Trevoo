import api from "./../interceptor/api";

export const Redirect = async () => {
  try {
    const response = await api.get("/me");
    console.log("info:", response.data);
    return response.data || false;
  } catch (err) {
    if (err.isRefreshError) {
      console.log("Ошибка refresh-токена:", err.response.data);
    } else {
      console.log("Ошибка запроса:", err.response.data);
    }
    return false;
  }
};
