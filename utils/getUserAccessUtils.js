import { getMenuAccessDetails } from "@/apis";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export const useGetUserAccessUtils = () => {
  const roleIdData = Cookies.get("roleId");
  const rawMenuName = Cookies.get("menuName");
  const menuName = rawMenuName ? decodeURIComponent(rawMenuName) : "";
  const roleId = roleIdData || 3;
  const [data, setData] = useState();

  useEffect(() => {
    const dataFetching = async () => {
      const obj = { roleId, menuName };
      const res = await getMenuAccessDetails(obj);
      setData(res?.data);
    };

    dataFetching();
  }, [roleId, menuName]);

  return { data };
};
