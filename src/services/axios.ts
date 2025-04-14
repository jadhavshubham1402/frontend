import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/reducer';
import { errorToast } from '../toastConfig';

const publicApisPath = ['/api/login'];

const Axios = axios.create({
  baseURL: "http://localhost:5000/",
});

Axios.interceptors.request.use(
  function (request) {
    if (store.getState().auth.token && !publicApisPath.includes(request.url || '')) {
      request.headers['authorization'] = `Bearer ${store.getState().auth.token}`;
    }
    return request;
  },
  function (error) {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.log('Inside interceptor ===>', { error });
    const statusCode = error.response?.status || error.code;
    const errorMessage =
      error.response?.data?.message || error.message || 'Something Went Wrong!!';

    switch (statusCode) {
      case 403:
      case 401:
        errorToast('Session Expired!');
        // store.dispatch(setToken(null));
        store.dispatch(logout());
        break;
      case 404:
        console.log('404');
        return Promise.reject(error);
      case 500:
        console.log('Error 500 ===>', errorMessage, { statusCode });
        return Promise.reject(error);
      case 'ERR_NETWORK':
        return Promise.reject(error);
      default:
        console.log('Error Default ===>', errorMessage, { statusCode });
        return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default Axios;