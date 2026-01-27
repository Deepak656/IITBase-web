export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const getRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('role');
};

export const setRole = (role: string): void => {
  localStorage.setItem('role', role);
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const isAdmin = (): boolean => {
  return getRole() === 'ADMIN';
};