import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const fieldData = {
    uploadFields: [
        {
            label: "Shipping Line",
            name: "shippingLineId",
            type: "dropdown",
            tableName: "tblCompany c",
            displayColumn: "c.name",
            orderBy: "c.name",
            foreignTable: "name,tblCompany",
            isEdit: true,
            required: true,
        },
    ],

    tblDpdParty: [
        { label: "Name", name: "partyName", isEdit: true, required: true },
        { label: "DPD Code", name: "dpdCode", isEdit: true },
        { label: "PAN Number", name: "panNo", isEdit: true },
        { label: "IEC Code", name: "iecCode", isEdit: true },
    ],
};

export default fieldData;

export const dpdGridButtons = [
    { text: "Add", icon: <AddIcon />, func: "gridAddHandler" },
    { text: "Delete", icon: <CloseIcon />, func: "gridDeleteHandler" },
];
