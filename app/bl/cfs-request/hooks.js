// hooks/useSetDefaultLocation.ts
import { getDataWithCondition } from "@/apis";
import { useEffect } from "react";

export function useSetDefault({
  userData,
  setFormData,
  mode,
}) {
  useEffect(() => {
    if (mode?.mode !== null) return;
    if (!userData?.location) return;

    let isMounted = true;

    const setDefaults = async () => {
      try {
        const payload = {
          columns:
            "t.id as Id,t.name as Name",
          tableName: "tblLocation t",
          whereCondition: `t.id = '${userData.location}' and t.status = 1`,
          joins:
            "left join tblMasterData m on m.masterListName = 'tblCfsStatusType' AND m.name = 'Pending'",
        };

        const res = await getDataWithCondition(payload);
        const data = res && res?.data[0];
        if (data) {
          setFormData((prev) => {
            return {
              ...prev,
              locationId: { Id: data?.Id, Name: data?.Name },
              cfsRequestStatusId: {
                Id: data?.statusId,
                Name: data?.statusName,
              },
            };
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    setDefaults();

    return () => {
      isMounted = false;
    };
  }, [userData?.location, setFormData, mode?.mode]);
}
