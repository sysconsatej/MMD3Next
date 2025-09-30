import { useEffect } from "react";

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
