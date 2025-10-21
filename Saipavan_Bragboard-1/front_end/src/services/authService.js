export const saveToken = (token) => {
  localStorage.setItem('bragboard_token', token);
};

export const getToken = () => {
  return localStorage.getItem('bragboard_token');
};

export const removeToken = () => {
  localStorage.removeItem('bragboard_token');
};