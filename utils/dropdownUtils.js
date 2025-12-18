import { getDataWithCondition } from "@/apis";

let vesselChangeReq = 0;

const inferVoyageField = (vesselField) => {
    if (vesselField === "vesselId") return "voyageId";
    if (vesselField === "vessel") return "voyage";
    if (vesselField === "podVesselId") return "podVoyageId";
    return "podVoyageId";
};

export const createHandleChangeEventFunction = ({ setFormData }) => {
    return {
        handleChangeOnVessel: async (name, value, opts = {}) => {
            const voyageField = opts?.voyageField || inferVoyageField(name);

            const reqId = ++vesselChangeReq;
            const vesselId = value?.Id ?? value?.id ?? null;

            setFormData((prev) => ({
                ...prev,
                [name]: vesselId ? value : null,
                [voyageField]: null,
            }));

            if (!vesselId) return;

            try {
                const obj = {
                    columns: "t.id as Id, t.voyageNo as Name",
                    tableName: "tblVoyage t",
                    whereCondition: `t.vesselId = ${vesselId} and t.status = 1`,
                    orderBy: "t.voyageNo",
                };

                const { data, success } = await getDataWithCondition(obj);

                if (reqId !== vesselChangeReq) return;

                if (success && Array.isArray(data) && data.length === 1) {
                    setFormData((prev) => ({
                        ...prev,
                        [voyageField]: data[0],
                    }));
                }
            } catch (e) {
                console.error("handleChangeOnVessel error:", e);
            }
        },
    };
};
