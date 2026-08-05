import axios from 'axios';

// One axios instance; every response resolves to the raw JSON body,
// and every error throws an Error with the server's {error} message.
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('peaffee-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.error || 'Request failed';
    throw new Error(msg);
  }
);

export default api;
