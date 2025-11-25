import { getDataWithCondition } from "@/apis";

export const validateContainerForMBL = async (
  containerNo,
  mblNo,
) => {
  if (!mblNo) {
    return { valid: false, message: "MBL No is required for Containers" };
  }

  const reqBody = {
    columns: "c.containerNo",
    tableName: "tblBlContainer c",
    joins: `left join tblBl b on b.id = c.blId`,
    whereCondition: `b.mblNo = '${mblNo}'`,
  };

  try {
    const { data: getContainerNos } = await getDataWithCondition(reqBody);

    if (!Array.isArray(getContainerNos) || getContainerNos.length === 0) {
      return {
        valid: false,
        message: "No Container records found for this MBL",
      };
    }

    // check if any container matches
    for (let i = 0; i < getContainerNos.length; i++) {
      if (getContainerNos[i]?.containerNo === containerNo) {
        return { valid: true };
      }
    }

    return {
      valid: false,
      message: "Container No does not match for the given MBL No",
    };
  } catch (err) {
    return {
      valid: false,
      message: err?.error?.message || "Unable to validate container number",
    };
  }
};
