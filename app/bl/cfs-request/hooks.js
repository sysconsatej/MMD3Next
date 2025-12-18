// hooks/useSetDefaultLocation.ts
import { getDataWithCondition } from "@/apis";
import { useEffect } from "react";

export function useSetDefault({ userData, setFormData }) {
  useEffect(() => {
    if (!userData?.location) return;

    let isMounted = true;

    const setLocation = async () => {
      try {
        const data = await getDataWithCondition({
          columns: "t.id as Id, t.name as Name",
          tableName: "tblLocation t",
          whereCondition: `t.id = '${userData.location}' and t.status = 1`,
          orderBy: "t.name",
        });

        if (
          isMounted &&
          data?.success &&
          data.data?.length > 0
        ) {
          setFormData((prev) => ({
            ...prev,
            locationId: data.data[0],
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    setLocation();

    return () => {
      isMounted = false;
    };
  }, [userData?.location, setFormData]);
}
