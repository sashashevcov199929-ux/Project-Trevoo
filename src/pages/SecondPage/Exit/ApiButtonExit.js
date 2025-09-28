import api from "../../../interceptor/api";

export const logout = async () => {
  try {
    const response = await api.post("/logout", {});
    console.log("exit", response);
    return response.data;
  } catch (error) {
    console.log("ошибка выхода");
  }
};
