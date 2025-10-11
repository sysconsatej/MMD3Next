import { useEffect } from "react";
import { toast } from "react-toastify";

export function useTotalGrossAndPack(formData, setTotals) {
  useEffect(() => {
    if (Array.isArray(formData?.tblBl)) {
      const totalVal = formData?.tblBl?.reduce(
        (tSum, item) => {
          const totalContainer = item?.tblBlContainer?.reduce(
            (sum, c) => {
              sum.gross += Number(c?.grossWt) || 0;
              sum.pack += Number(c?.noOfPackages) || 0;
              return sum;
            },
            {
              gross: 0,
              pack: 0,
            }
          );

          tSum.tGross += totalContainer?.gross || 0;
          tSum.tPack += totalContainer?.pack || 0;

          return tSum;
        },
        { tGross: 0, tPack: 0 }
      );

      setTotals({
        grossWt: totalVal.tGross || 0,
        packages: totalVal.tPack || 0,
      });
    }
  }, [formData?.tblBl]);
}

export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch.mblNo) {
    condition.push(`b.mblNo = '${advanceSearch.mblNo}'`);
  }

  if (advanceSearch.hblNo) {
    condition.push(`b.hblNo = '${advanceSearch.hblNo}'`);
  }

  if (advanceSearch.podId) {
    condition.push(`b.podId = '${advanceSearch.podId.Id}'`);
  }

  if (advanceSearch.cargoTypeId) {
    condition.push(`b.cargoTypeId = '${advanceSearch.cargoTypeId.Id}'`);
  }

  if (advanceSearch.fromDate && advanceSearch.toDate) {
    condition.push(
      `b.mblDate between '${advanceSearch.fromDate}' and '${advanceSearch.toDate}'`
    );
  }

  return condition.length > 0 ? condition.join(" and ") : null;
}

export const copyHandler = (
  formData,
  setFormData,
  direction,
  mapping,
  toastMessage,
  tabIndex
) => {
  const updatedFormData = { ...formData };
  updatedFormData.tblBl = [...(formData.tblBl || [])];
  updatedFormData.tblBl[tabIndex] = { ...(formData.tblBl[tabIndex] || {}) };

  const fieldMapping =
    direction === "left"
      ? mapping
      : Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));

  Object.entries(fieldMapping).forEach(([sourceKey, targetKey]) => {
    if (formData?.tblBl?.[tabIndex][sourceKey]) {
      updatedFormData.tblBl[tabIndex][targetKey] =
        formData.tblBl[tabIndex][sourceKey];
    }
  });

  setFormData(updatedFormData);
  toast.success(toastMessage);
};
