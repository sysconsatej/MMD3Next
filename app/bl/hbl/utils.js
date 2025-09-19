import { useCallback, useEffect, useState } from "react";
import { getDataWithCondition } from "@/apis";
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

export function useRecordNavigator({
  currentId,
  tableName = "tblBl",
  idField = "id",
  labelField = "mblNo",
}) {
  const [neighbors, setNeighbors] = useState({ prev: null, next: null });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (currentId == null) return;

    setLoading(true);
    try {
      const whereCondition = `
        ${idField} in (
          (select max(${idField}) from ${tableName} where ${idField} < ${currentId} and status = 1),
          ${currentId},
          (select min(${idField}) from ${tableName} where ${idField} > ${currentId} and status = 1)
        ) and status = 1`;

      const { success, data } = await getDataWithCondition({
        tableName,
        columns: `${idField}, ${labelField}`,
        whereCondition,
      });

      const list = Array.isArray(data) ? data : [];
      let prev = null,
        next = null;

      for (const row of list) {
        if (row[idField] < currentId) prev = row;
        else if (row[idField] > currentId) next = row;
      }

      setNeighbors({ prev, next });
    } catch (err) {
      console.error("useRecordNavigator error:", err);
      setNeighbors({ prev: null, next: null });
    } finally {
      setLoading(false);
    }
  }, [currentId, tableName, idField, labelField]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    prevId: neighbors.prev?.[idField] || null,
    nextId: neighbors.next?.[idField] || null,
    prevLabel: neighbors.prev?.[labelField] || null,
    nextLabel: neighbors.next?.[labelField] || null,
    canPrev: !!neighbors.prev,
    canNext: !!neighbors.next,
    refresh,
  };
}
