import axiosInstance from './axiosInstance'; // Import the axios instance

export const getDataAPI = async (url, token) => {
  const res = await axiosInstance.get(`/api/${url}`, {
    headers: { Authorization: token },
  });

  return res;
};

export const postDataAPI = async (url, post, token) => {
  const res = await axiosInstance.post(`/api/${url}`, post, {
    headers: { Authorization: token },
  });

  return res;
};

export const putDataAPI = async (url, post, token) => {
  const res = await axiosInstance.put(`/api/${url}`, post, {
    headers: { Authorization: token },
  });

  return res;
};

export const patchDataAPI = async (url, post, token) => {
  const res = await axiosInstance.patch(`/api/${url}`, post, {
    headers: { Authorization: token },
  });

  return res;
};

export const deleteDataAPI = async (url, post, token) => {
  const res = await axiosInstance.delete(`/api/${url}`, post, {
    headers: { Authorization: token },
  });

  return res;
};

export const fetchDeleteDataAPI = async (url, post, token) => {
  const res = await fetch(`/api/${url}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(post),
  });

  const data = await res.json();

  return data;
};
export const deleteData = async (url, token) => {
  const res = await fetch(`/api/${url}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  });

  const data = await res.json();

  return data;
};
