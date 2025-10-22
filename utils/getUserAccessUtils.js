import { getMenuAccessDetails } from "@/apis";
import { auth } from "@/store/index";
import { useEffect, useState } from "react";

export const useGetUserAccessUtils = (menuName) => {
  const { userData } = auth();
  const roleId = userData?.data?.roleId;
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
