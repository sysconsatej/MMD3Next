import { getMenuAccessDetails } from "@/apis";

import { useEffect, useState } from "react";

export const useGetUserAccessUtils = () => {
  const [roleId, setRoleId] = useState(3);
  const [menuName, setMenuName] = useState("");
  const [data, setData] = useState();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const roleIdFromSession = sessionStorage.getItem("roleId");
    const rawMenuName = sessionStorage.getItem("menuName");
    setRoleId(roleIdFromSession ? Number(roleIdFromSession) : 3);
    setMenuName(rawMenuName ? decodeURIComponent(rawMenuName) : "");
  }, []);

  useEffect(() => {
    if (!menuName) return;
    const dataFetching = async () => {
      const obj = { roleId, menuName };
      const res = await getMenuAccessDetails(obj);
      setData(res?.data);
    };

    dataFetching();
  }, [roleId, menuName]);

  return { data };
};
