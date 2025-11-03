export const statusOptions = [
    { label: "Hold", value: "1" },
    { label: "Unhold", value: "0" },
];

export const holdFields = [
    { label: "PAN/IEC No.", name: "consigneeIdNo", isEdit: true },
    { label: "Party Name", name: "consigneeText", isEdit: true },
    { label: "BL No.", name: "blNo", isEdit: true },
];

export const tableMeta = [
    { fieldname: "__sr", label: "Sr. No.", isEdit: false },
    { fieldname: "partyName", label: "Party Name", isEdit: false },
    { fieldname: "consigneeIdNo", label: "PAN/IEC No.", isEdit: false },
    { fieldname: "blNo", label: "BL Number", isEdit: false },
    { fieldname: "podText", label: "Location", isEdit: false },

    {
        fieldname: "holdRemarks",
        label: "DO Hold Remark",
        isEdit: true,
        type: "text",
        editorType: "textarea",
        multiline: true,
        minRows: 2,
        maxRows: 4,
        inputProps: { multiline: true, minRows: 2, maxRows: 4 },
        width: 280,
    },

    {
        label: "Status",
        name: "holdStatus",
        type: "dropdown",
        tableName: "tblMasterData m",
        displayColumn: "m.name",
        where: "m.masterListName = 'tblBlHoldStatus'",
        orderBy: "m.name",
        foreignTable: "name,tblMasterData",
        isEdit: true,
    },

];

const fieldData = { holdFields, tableMeta, statusOptions };
export default fieldData;
