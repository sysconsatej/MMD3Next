import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export const fieldData = {
    doRequestFields: [
        {
            label: "MBL No",
            name: "mblNo",
            isEdit: true,
        },
        {
            label: "MBL Date",
            name: "mblDate",
            type: "date",
            isEdit: true,
            required: true,
        },
        {
            label: "HBL No",
            name: "hblNo",
            isEdit: true,
        },
        {
            label: "HBL Date",
            name: "hblDate",
            type: "date",
            isEdit: true,
        },
    ],
    transportDetails: [
        {
            label: "PLR",
            name: "plrId",
            type: "dropdown",
            tableName: "tblPort p",
            displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
            orderBy: "p.name",
            foreignTable: "code-name,tblPort",
            isEdit: true,
            required: true,
        },
        {
            label: "POL",
            name: "polId",
            type: "dropdown",
            tableName: "tblPort p",
            displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
            orderBy: "p.name",
            foreignTable: "code-name,tblPort",
            isEdit: true,
            required: true,
        },
        {
            label: "POD",
            name: "podId",
            type: "dropdown",
            tableName: "tblPort p",
            displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
            orderBy: "p.name",
            foreignTable: "code-name,tblPort",
            isEdit: true,
            required: true,
        },
        {
            label: "FPD",
            name: "fpdId",
            type: "dropdown",
            tableName: "tblPort p",
            displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
            orderBy: "p.name",
            foreignTable: "code-name,tblPort",
            isEdit: true,
            required: true,
        },
        {
            label: "Consignee",
            name: "consigneeText",
            isEdit: true,
            required: true,
        },
        {
            label: "HSS",
            name: "",
            type: "radio",
            radioData: [
                { label: "Yes", value: "1" },
                { label: "No", value: "0" },
            ],
            isEdit: true,
        },
        {
            label: "Clearing Agent",
            name: "",
            isEdit: true,
        },
        {
            label: "Depot",
            name: "depotId",
            type: "dropdown",
            tableName: "tblDepot d",
        },
       {
            label: "Vessel",
            name: "podVesselId",
            type: "dropdown",
            tableName: "tblVessel t",
            idColumn: "id",
            displayColumn: "t.name",
            searchColumn: "t.name",
            orderBy: "t.name",
            isEdit: true,
        },
        {
            label: "Voyage",
            name: "podVoyageId",
            type: "dropdown",
            tableName: "tblVoyage t",
            idColumn: "id",
            displayColumn: "t.voyageNo",
            searchColumn: "t.voyageNo",
            selectedConditions: [{ podVesselId: "vesselId" }],
            orderBy: "t.voyageNo",
            isEdit: true,
        },
    ],
    ShipmentDetails: [
        {
            label: "Surveyor Name",
            name: "",
            isEdit: true,
        },

        {
            label: "DO No",
            name: "",
            isEdit: true,
        },

        {
            label: "Do Date",
            name: "doDate",
            type: "date",
            isEdit: true,
        },

        {
            label: "Do Validity Date",
            name: "doValidityDate",
            type: "date",
            isEdit: true,
        },



    ],

    ContainerNew: [

        {
            label: "Select For Do",
            name: "DoSelect",
            isEdit: true,
            type: "checkbox",
        },
        {
            label: "Container No",
            name: "containerNo",
            isEdit: true,
        },
        {
            label: "Size",
            name: "sizeId",
            type: "dropdown",
            tableName: "tblMasterData m",
            displayColumn: "ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'')",
            where: "m.masterListName = 'tblSize'",
            orderBy: "m.name",
            foreignTable: "code-name,tblMasterData",
            isEdit: true,
            changeFun: "setISOBySize",
        },
        {
            label: "Type",
            name: "typeId",
            type: "dropdown",
            tableName: "tblMasterData m",
            displayColumn: "ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'')",
            where: "m.masterListName = 'tblType'",
            orderBy: "m.name",
            foreignTable: "code-name,tblMasterData",
            isEdit: true,
            changeFun: "setISOByType",
        },

    ],

    attachmentFields: [
        {
            name: "attachment",
            type: "fileupload",
            isEdit: true,
            dragDrop: true,
        },
    ],
};




export const advanceSearchFields = {

};

