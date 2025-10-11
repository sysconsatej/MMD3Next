import axios from "axios";

const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "");

const cleanTableName = (t) =>
  String(t || "")
    .trim()
    .split(/\s+/)[0]
    .replace(/^dbo\./i, "");

export const updateStatusRows = async ({
  tableName,
  rows,
  keyColumn = "id",
}) => {
  const tbl = cleanTableName(tableName);
  if (!tbl) return { success: false, message: "tableName is required" };
  if (!Array.isArray(rows) || rows.length === 0)
    return { success: false, message: "'rows' must be a non-empty array" };

  try {
    const res = await axios.post(
      `${BASE}/api/v1/updateStatus`,
      { tableName: tbl, rows, keyColumn },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message };
  }
};

export const updateStatusBulk = async ({
  tableName,
  ids,
  blStatus,
  remarks = null,
  keyColumn = "id",
  updatedBy = null,
}) => {
  const payload = (ids || []).map((id) => ({
    [keyColumn]: id,
    ...(blStatus !== undefined ? { blStatus } : {}),
    ...(remarks !== null ? { remarks } : {}),
    ...(updatedBy !== null ? { updatedBy } : {}),
  }));
  return updateStatusRows({ tableName, rows: payload, keyColumn });
};
