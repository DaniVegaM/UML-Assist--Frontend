import { redirect } from "react-router";

export const requireAuth = () => {
  const accessToken = localStorage.getItem("access_token");
  const userData = localStorage.getItem("user_data");

  if (!accessToken || !userData) {
    return redirect("/iniciar-sesion");
  }

  return null;
};
