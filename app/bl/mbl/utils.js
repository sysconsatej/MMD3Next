import { getDataWithCondition } from "@/apis";
import { useEffect } from "react";
export const storeApiResult = [];


export function useTotalGrossAndPack(formData, setTotals) {
  useEffect(() => {
    let grossWt = 0;
    let packages = 0;

    if (formData?.tblBlContainer && Array.isArray(formData.tblBlContainer)) {
      grossWt += formData.tblBlContainer.reduce(
        (sum, c) => sum + (Number(c.grossWt) || 0),
        0
      );
      packages += formData.tblBlContainer.reduce(
        (sum, c) => sum + (Number(c.noOfPackages) || 0),
        0
      );
    }

    if (formData?.item && Array.isArray(formData.item)) {
      packages += formData.item.reduce(
        (sum, i) => sum + (Number(i.itemNoOfPackages) || 0),
        0
      );
    }

    setTotals({ grossWt, packages });
  }, [formData.tblBlContainer, formData.item]);
}

export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch.blNo) {
    condition.push(
      `(b.mblNo = '${advanceSearch.blNo}') or (b.hblNo = '${advanceSearch.blNo}')`
    );
  }

  if (advanceSearch.mblDate) {
    condition.push(`b.mblDate = '${advanceSearch.mblDate}'`);
  }

  return condition.length > 0 ? condition.join(" and ") : null;
}

export const checkNoPackages = ({ formData, hblType }) => {
  if (hblType === "HBL") {
    if (!Array.isArray(formData?.tblBl)) return "";

    const errors = [];

    formData.tblBl.forEach((row, idx) => {
      const parentPackages = Number(row?.noOfPackages || 0);

      const childTotal = Array.isArray(row?.tblBlPackingList)
        ? row.tblBlPackingList.reduce(
          (sum, cur) => sum + Number(cur?.noOfPackages || 0),
          0
        )
        : 0;

      if (parentPackages !== childTotal) {
        errors.push(
          `${row?.hblNo} Total No of Packages (${childTotal}) in Item Details does not match  No of Packages (${parentPackages})`
        );
      }
    });

    return errors.length > 0 ? errors : "";
  }

  const totalPackages = Array.isArray(formData?.tblBlPackingList)
    ? formData.tblBlPackingList.reduce(
      (sum, cur) => sum + Number(cur?.noOfPackages || 0),
      0
    )
    : 0;

  return totalPackages === Number(formData?.noOfPackages)
    ? ""
    : `Total No of Packages does not match with  No of Packages (${formData?.noOfPackages})`;
};


export const getPortBasedOnCountry = async ({ portId, inputName }) => {
  const obj = {
    columns: `
    p.id AS Id,
    p.name AS PortName,
    CASE 
      WHEN c.name = 'India' THEN 'IN'
      ELSE 'F'
    END AS countryCategory
  `,
    tableName: `
    tblPort p 
    LEFT JOIN tblCountry c ON c.id = p.countryId
  `,
    whereCondition: `p.id = ${portId}`
  };
  const result = await getDataWithCondition(obj)
  const newEntry = {
    ...result?.data[0], inputName: inputName
  }
  const existingIndex = storeApiResult.findIndex(item => item.inputName === inputName);
  if (existingIndex > -1) {
    storeApiResult[existingIndex] = newEntry;
  } else {
    storeApiResult.push(newEntry);
  }

  return result?.data[0]
}


