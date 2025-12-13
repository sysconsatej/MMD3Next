import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export const fieldData = {
    doRequestFields: [
        {
            label: "BL No",
            name: "blNo",
            isEdit: true,
            required: true,
        },
        {
            label: "BL Date",
            name: "blDate",
            type: "date",
            isEdit: true,
            required: true,
        },
        {
            label: "Liner",
            name: "shippingLineId",
            type: "dropdown",
            tableName: "tblCompany t",
            displayColumn: "t.name",
            orderBy: "t.name",
            foreignTable: "name,tblCompany",
            required: true,
            isEdit: true,
        },
    ],
    transportDetails: [

        // {
        //     label: "POL",
        //     name: "polId",
        //     type: "dropdown",
        //     tableName: "tblPort p",
        //     displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
        //     orderBy: "p.name",
        //     foreignTable: "code-name,tblPort",
        //     isEdit: true,
        //     required: true,
        // },
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
            label: "Type of Cargo",
            name: "cargoTypeId",
            type: "dropdown",
            tableName: "tblMasterData m",
            displayColumn: "m.code",
            where: "m.masterListName = 'tblCargoType'",
            foreignTable: "code,tblMasterData",
            orderBy: "m.name",
            isEdit: true,
        },
        {
            label: "Type Of Delivery",
            name: "deliveryTypeId",
            type: "dropdown",
            tableName: "tblMasterData m",
            displayColumn: "m.name",
            orderBy: "m.name",
            where: "m.masterListName='tblStuffingDestuffingType'",
            foreignTable: "name,tblMasterData",
            isEdit: true,
        },

        {
            label: "Seaway/Telex BL",
            name: "seawayTelexBl",
            type: "radio",
            radioData: [
                { label: "Yes", value: "1" },
                { label: "No", value: "0" },
            ],
            isEdit: true,
        },
        {
            label: "Free days",
            name: "freeDays",
            isEdit: true,
            type: "checkbox",
        },

    ],
    ShipmentDetails: [
        {
            label: "HSS Customer Name",
            name: "hssCustomerName",
            isEdit: true,
        },
        {
            label: "Factory Address",
            name: "factoryAddress",
            type: "textarea",
            isEdit: true,
        },
        {
            label: "Factory Location Pin",
            name: "factoryLocationPin",
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
            displayColumn: "m.name",
            where: "m.masterListName = 'tblSize'",
            orderBy: "m.name",
            foreignTable: "name,tblMasterData",
            isEdit: true,
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

