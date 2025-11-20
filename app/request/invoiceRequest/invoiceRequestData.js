import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const fieldData = {
  igmFields: [
    {
      label: "Liner Name",
      name: "shippingLineId",
      type: "dropdown",
      tableName: "tblCompany t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      foreignTable: "name,tblCompany",
      orderBy: "t.name",
      isEdit: true,
      required: true,
    },
    {
      label: "BL NO",
      name: "blNo",
      required: true,
      isEdit: true,
      blurFun: "duplicateHandler",
    },

    // {
    //   label: "Type",
    //   name: "type",
    //   type: "dropdown",
    //   tableName: "tblMasterData m",
    //   idColumn: "id",
    //   displayColumn: "m.name",
    //   searchColumn: "m.name",
    //   orderBy: "m.name",
    //   where: "m.masterListName = 'tblServiceType'",
    //   isEdit: true,
    //   required: true,
    // },
    // {
    //   label: "BL Location",
    //   name: "blLocation",
    //   type: "dropdown",
    //   tableName: "tblPort p",
    //   idColumn: "id",
    //   displayColumn: "p.name",
    //   searchColumn: "p.name",
    //   joins: "JOIN tblMasterData m ON m.id = p.portTypeId",
    //   where: "m.name IN ('SEA PORT','INLAND PORT')",
    //   orderBy: "p.name",
    //   isEdit: true,
    //   required: true,
    // },
    {
      label: "Type Of Delivery ",
      name: "deliveryTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblStuffingDestuffingType'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
      required: true,
    },
    {
      name: "isFreeDays",
      type: "radio",
      radioData: [
        { label: "Free Days", value: "F" },
        { label: "Do Extension", value: "D" },
      ],
      isEdit: true,
      blurFun: "duplicateHandler",
    },
    // {
    //   label: "Free Days",
    //   name: "isFreeDays",
    //   isEdit: true,
    //   type: "checkbox",
    //   defaultValue: true,
    // },
    {
      label: " Valid Till",
      name: "validTill",
      type: "date",
      isEdit: true,
    },
    // {
    //   label: "Do Extension",
    //   name: "isFreeDays",
    //   isEdit: true,
    //   type: "checkbox",
    // },
    {
      label: "High Sea Sales",
      name: "isHighSealSale",
      isEdit: true,
      type: "checkbox",
    },

    {
      label: "Remarks",
      name: "remarks",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
  ],
  invoiceFields: [
    {
      label: "Name",
      name: "billingPartyName",
      isEdit: true,
    },
    {
      label: "GSTIN/Provisional ID",
      name: "billPartyGSTIN",
      isEdit: true,
    },
    {
      label: "Address",
      name: "billingPartyAddress",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
    {
      label: "Contact",
      name: "billingPartyTelNo",
      type: "number",
      isEdit: true,
    },
    {
      label: "Email",
      name: "billingPartyEmailId",
      isEdit: true,
    },
  ],
  tblAttachment: [
    {
      label: "Select",
      name: "attachmentTypeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblInvoiceAttachmentType'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: "Upload",
      name: "path",
      type: "fileupload",
      isEdit: true,
    },
    {
      label: "Remarks",
      name: "remarks",
      isEdit: true,
    },
  ],
  tblInvoiceRequestContainer: [
    {
      label: "Container No",
      name: "containerNo",
      isEdit: true,
    },
    {
      label: "Container Size",
      name: "sizeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblSize'",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
    {
      label: " Valid Till",
      name: "validTill",
      type: "date",
      isEdit: true,
    },
  ],
};

export default fieldData;
export const cfsGridButtons = [
  {
    text: "Add ",
    icon: <AddIcon />,
    func: "gridAddHandler",
  },
  {
    text: "Delete ",
    icon: <CloseIcon />,
    func: "gridDeleteHandler",
  },
];
export const advanceSearchFields = {
  bl: [
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
    },
    {
      label: "Status",
      name: "statusId",
      type: "multiselect",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblInvoiceRequest'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
    },
  ],
};
export function advanceSearchFilter(advanceSearch) {
  if (Object.keys(advanceSearch).length <= 0) return null;
  const condition = [];

  if (advanceSearch.blNo) {
    condition.push(`i.blNo = '${advanceSearch.blNo}'`);
  }

  if (advanceSearch.statusId) {
    condition.push(
      `i.invoiceRequestStatusId in (${advanceSearch.statusId
        .map((item) => item.Id)
        .join(",")})`
    );
  }

  return condition.length > 0 ? condition.join(" and ") : null;
}

export function statusColor(status) {
  const map = {
    Requested: "#4E61D3", // Blue
    Released: "green", // Green
    Rejected: "#DC0E0E", // Red
  };

  return map[status] || "inherit";
}
