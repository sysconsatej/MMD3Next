import axios from "axios";
const url = process.env.NEXT_PUBLIC_BACKEND_URL;

export const insertAccess = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/access`, obj);
    return res.data;
  } catch (e) {
    return { message: e };
  }
};

export const getMenuAccessDetails = async (obj) => {
  try {
    const res = await axios.post(`${url}api/v1/access/getByRole`, obj);
    return res.data;
  } catch (e) {
    return { message: e };
  }
};

export const getRoleAccessByRole = async ({ roleId }) => {
  try {
    const res = await axios.post(`${url}api/v1/access/getRoleAccess`, {
      roleId: roleId,
    });
    return res.data;
  } catch (e) {
    return { message: e };
  }
};
