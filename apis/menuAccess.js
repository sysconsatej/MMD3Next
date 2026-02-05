import api from "./interceptor";

export const insertAccess = async (obj) => {
  try {
    const res = await api.post(`access`, obj);
    return res.data;
  } catch (e) {
    return { message: e };
  }
};

export const getMenuAccessDetails = async (obj) => {
  try {
    const res = await api.post(`access/getByRole`, obj);
    return res.data;
  } catch (e) {
    return { message: e };
  }
};

export const getRoleAccessByRole = async ({ roleId }) => {
  try {
    const res = await api.post(`access/getRoleAccess`, {
      roleId: roleId,
    });
    return res.data;
  } catch (e) {
    return { message: e };
  }
};


export const getSpecificRoleMenuButtons = async ({ roleId }) => {
  try {
    const res = await api.post(`access/specific-role`, {
      roleId: roleId,
    });
    return res.data;
  } catch (e) {
    return { message: e };
  }
};
