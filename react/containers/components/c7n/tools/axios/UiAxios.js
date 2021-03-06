import axios from 'axios';
import { authorizeUrl } from '../../../../common/authorize';
import { getAccessToken, removeAccessToken } from '../../../../common/accessToken';
import { API_HOST } from '../../../../common/constants';

const regTokenExpired = /(PERMISSION_ACCESS_TOKEN_NULL|PERMISSION_ACCESS_TOKEN_EXPIRED)/;

const instance = axios.create({
  timeout: 30000,
  baseURL: API_HOST,
});

instance.interceptors.request.use(
  (config) => {
    const newConfig = config;
    newConfig.headers['Content-Type'] = 'application/json';
    newConfig.headers.Accept = 'application/json';
    if (newConfig.params) {
      const { pagesize, size } = newConfig.params;
      if (pagesize && !size) {
        newConfig.params.size = pagesize;
        delete newConfig.params.pagesize;
      }
    }
    const accessToken = getAccessToken();
    if (accessToken) {
      newConfig.headers.Authorization = accessToken;
    }
    return newConfig;
  },
  (err) => {
    const error = err;
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return response;
    }
    if (response.data.failed === true) {
      throw response.data;
    } else {
      return response.data;
    }
  },
  (error) => {
    const { response } = error;
    if (response) {
      const { status } = response;
      switch (status) {
        case 401: {
          removeAccessToken();
          authorizeUrl();
          break;
        }
        case 403: {
          if (regTokenExpired.test(response.data)) {
            removeAccessToken();
            authorizeUrl();
          }
          break;
        }
        default:
          break;
      }
    }
    throw error;
  },
);

export default instance;
