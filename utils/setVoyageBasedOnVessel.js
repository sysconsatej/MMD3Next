import { getDataWithCondition } from "@/apis";

export const setVoyageBasedonVessel = async ({ vesselId, companyId }) => {
  const obj = {
    columns: "t.id as Id, t.voyageNo as Name",
    tableName: "tblVoyage t",
    whereCondition: `t.vesselId = '${vesselId}' and t.companyid = '${companyId}'  and t.status = 1`,
    orderBy: "t.voyageNo",
  };

  try {
    const { data, success } = await getDataWithCondition(obj);
    return { data: success ? data : [] };
  } catch (err) {
    return { errorMessage: err };
  }
};
