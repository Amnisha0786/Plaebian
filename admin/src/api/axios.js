import axios from "axios";
import { API_URL } from "src/config";


const defaulHeader = {
  headers: {
    "accept": "application/json",
    "Content-Type": "application/json",
  },
};

const instance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json",
    },
});

const requestWithoutAuth = axios.create({
  baseURL: API_URL,
  timeout: 6000,
  defaulHeader,
});
requestWithoutAuth.defaults.headers.common = {
   ...requestWithoutAuth.defaults.headers.common,
}
 instance.defaults.headers.common = {
   ...instance.defaults.headers.common,
  };

export const postRequestNoAuth = ({ API = "", DATA = {}, HEADER = {}, PAYLOAD, CONFIG }) => {
  return new Promise((resolve, reject) => {
    requestWithoutAuth
      .post(
        API,
        DATA, {
          ...(PAYLOAD ? PAYLOAD : { ...defaulHeader.headers, ...HEADER }),
          ...CONFIG
        }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error.response);
      });
  });
};

export const updateAuthToken = (token = "") => {
  instance.defaults.headers = {
    ...instance.defaults.headers,
    ...{ Authorization: `bearer ${token}` },
  };
};

export const postRequest = ({ API = "", DATA = {}, HEADER = {}, PAYLOAD }) => {
  return new Promise((resolve, reject) => {
    instance
      .post(apiWithAuth(API), DATA, {
        ...(PAYLOAD ? PAYLOAD : {}),
        headers:  { ...defaulHeader.headers, ...HEADER }
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error.response);
      });
  });
};

export const getRequest = ({ API = "", headers = {}, params = {}, data = {}, responseType = "json" }) => {
  return new Promise((resolve, reject) => {
    instance
      .get(apiWithAuth(API), {
        ...defaulHeader.headers,
        ...(params),
        ...(headers),
        responseType: responseType,
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error.response);
      });
  });
};

export const putRequest = ({ API = "", DATA = {}, PAYLOAD, HEADER = {} }) => {
  return new Promise((resolve, reject) => {
    instance
      .put(apiWithAuth(API), DATA, {
        ...DATA,
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error.response);
      });
  });
};

export const deleteRequest = ({ API = "", DATA = {}, PAYLOAD, HEADER = {} }) => {
  return new Promise((resolve, reject) => {
    instance
      .delete(apiWithAuth(API), {
        headers: {
          ...defaulHeader.headers,
          ...HEADER,
        },
        data: DATA,
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error.response);
      });
  });
};

export const patchRequest = ({ API = "", DATA = {}, PAYLOAD, HEADER = {} }) => {
  return new Promise((resolve, reject) => {
    instance
      .patch(apiWithAuth(API), DATA, {
        ...({ ...defaulHeader.headers, ...HEADER }),
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error.response);
      });
  });
};

export const apiWithAuth = (api) => {
  return api;
};

export default instance;
