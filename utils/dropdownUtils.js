import { getDataWithCondition } from "@/apis";
import { getUserByCookies } from "./userInit";

let changeReq = 0;

const inferVoyageField = (vesselField) => {
    if (vesselField === "vesselId") return "voyageId";
    if (vesselField === "vessel") return "voyage";
    if (vesselField === "podVesselId") return "podVoyageId";
    return "podVoyageId";
};

const getId = (v) => v?.Id ?? v?.id ?? v?.value ?? null;

const getAlias = (tableName = "") => {
    const parts = String(tableName).trim().split(/\s+/);
    return parts.length >= 2 ? parts[parts.length - 1] : "t";
};

const buildWhereFromSelectedConditions = (selectedConditions = [], formData = {}) => {
    const parts = [];

    (selectedConditions || []).forEach((condObj) => {
        Object.entries(condObj || {}).forEach(([sourceFieldName, targetDbCol]) => {
            const srcVal = formData?.[sourceFieldName];
            const srcId = getId(srcVal);

            if (srcId !== null && srcId !== undefined && srcId !== "") {
                parts.push(`${targetDbCol} = ${Number(srcId)}`);
            }
        });
    });

    return parts.join(" and ");
};

const clearDependents = (fields = [], setFormData, changedName) => {
    const dependents = fields.filter((f) =>
        (f?.selectedConditions || []).some((c) =>
            Object.prototype.hasOwnProperty.call(c, changedName)
        )
    );

    if (!dependents.length) return;

    setFormData((prev) => {
        const next = { ...prev };
        dependents.forEach((d) => {
            next[d.name] = null;
        });
        return next;
    });

    dependents.forEach((d) => clearDependents(fields, setFormData, d.name));
};

export const createHandleChangeEventFunction = ({ setFormData, fields = [] }) => {
    const autoPickIfSingle = async (field, currentFormData, reqId) => {
        const whereFromParents = buildWhereFromSelectedConditions(
            field?.selectedConditions || [],
            currentFormData
        );

        if ((field?.selectedConditions?.length || 0) > 0 && !whereFromParents) return null;

        const alias = getAlias(field.tableName);
        const idCol = field?.idColumn || "id";

        const obj = {
            columns: field?.columns || `${alias}.${idCol} as Id, ${field?.displayColumn} as Name`,
            tableName: field.tableName,
            joins: field?.joins || "",
            whereCondition: [whereFromParents || null, field?.whereCondition || null]
                .filter(Boolean)
                .join(" and "),
            orderBy: field?.orderBy || "",
        };

        const { data, success } = await getDataWithCondition(obj);

        if (reqId !== changeReq) return null;

        if (success && Array.isArray(data) && data.length === 1) {
            return data[0];
        }
        return null;
    };

    const getSnapshot = () =>
        new Promise((resolve) => {
            setFormData((prev) => {
                resolve(prev);
                return prev;
            });
        });

    const autoCascade = async (parentName, reqId) => {
        let snapshot = await getSnapshot();
        if (!snapshot) return;

        const children = (fields || []).filter((f) =>
            (f?.selectedConditions || []).some((c) =>
                Object.prototype.hasOwnProperty.call(c, parentName)
            )
        );

        for (const child of children) {
            if (snapshot?.[child.name]) continue;

            const picked = await autoPickIfSingle(child, snapshot, reqId);
            if (picked) {
                await new Promise((resolve) => {
                    setFormData((prev) => {
                        const next = { ...prev, [child.name]: picked };
                        snapshot = next;
                        resolve();
                        return next;
                    });
                });
                await autoCascade(child.name, reqId);
            }
        }
    };

    return {
        handleChangeOnVessel: async (name, value, opts = {}) => {
            const userData = getUserByCookies();

            const voyageField = opts?.voyageField || inferVoyageField(name);
            const reqId = ++changeReq;

            const vesselId = getId(value);

            setFormData((prev) => ({
                ...prev,
                [name]: vesselId ? value : null,
                [voyageField]: null,
            }));

            clearDependents(fields, setFormData, name);
            clearDependents(fields, setFormData, voyageField);

            if (!vesselId) return;

            try {
                const obj = {
                    columns: "t.id as Id, t.voyageNo as Name",
                    tableName: "tblVoyage t",
                    whereCondition: `t.vesselId = ${Number(vesselId)} and t.status = 1 and t.comapanyid = ${userData?.companyId}`,
                    orderBy: "t.voyageNo",
                };

                const { data, success } = await getDataWithCondition(obj);
                if (reqId !== changeReq) return;

                if (success && Array.isArray(data) && data.length === 1) {
                    setFormData((prev) => ({
                        ...prev,
                        [voyageField]: data[0],
                    }));

                    await autoCascade(voyageField, reqId);
                }
            } catch (e) {
                console.error("handleChangeOnVessel error:", e);
            }
        },

        handleDropdownChange: async (name, value) => {
            const reqId = ++changeReq;
            const id = getId(value);

            setFormData((prev) => ({
                ...prev,
                [name]: id ? value : null,
            }));

            clearDependents(fields, setFormData, name);

            if (!id) return;

            try {
                await autoCascade(name, reqId);
            } catch (e) {
                console.error("handleDropdownChange error:", e);
            }
        },
    };
};
