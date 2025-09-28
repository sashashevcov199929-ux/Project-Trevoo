import api from "../../../interceptor/api";
//-------------------------------Регистер----------------------------------------------//
//-----------------------------------------------------------------------------//
export const registerUser = async (form) => {
  try {
    const response = await api.post("/register", form);
    return { success: true, data: response.data };
  } catch (err) {
    console.log("Ыфыф", err.response.data);
    const error =
      err.response?.data || "Произошла ошибка регистрации. Попробуйте позже.";

    return { success: false, error };
  }
};
//--------------------------------Авторизация---------------------------------------------//
//-----------------------------------------------------------------------------//
export const authUser = async (form) => {
  try {
    const response = await api.post("/auth", form);
    console.log("Успех:", response.data);
    return response.data;
  } catch (err) {
    console.log("ошибка 1", err.response);
    return err.response.data;
  }
};
//-----------------------------------------------------------------------------//
//-----------------------------------------------------------------------------//
export const resetPassword = async ({ email, token, newPassword }) => {
  try {
    const response = await api.post("/reset-password", {
      email,
      token,
      newPassword,
    });

    return response.data;
  } catch (err) {
    if (err.response && err.response.data) {
      throw new Error(err.response.data.error || "Ошибка сброса пароля");
    }
  }
};
