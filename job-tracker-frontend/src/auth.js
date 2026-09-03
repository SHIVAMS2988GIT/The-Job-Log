export const getToken = () => localStorage.getItem("token");
export const isAuthenticated = () => Boolean(getToken());

export const saveSession = (token, user) => {
  localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};
