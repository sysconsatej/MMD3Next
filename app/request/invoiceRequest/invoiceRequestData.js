import { Label } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const fieldData = {
  igmFields: [
    {
      label: "BL NO",
      name: "blNo",
      required: true,
      isEdit: true,
    },
    {
      label: "Requested By",
      name: "blNo",
      isEdit: true,
    },
    {
      label: "Type",
      name: "type",
      type: "dropdown",
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblServiceType'",
      isEdit: true,
      required: true,
    },
    {
      label: "BL Location",
      name: "blLocation",
      type: "dropdown",
      tableName: "tblPort p",
      idColumn: "id",
      displayColumn: "p.name",
      searchColumn: "p.name",
      orderBy: "p.name",
      isEdit: true,
      required: true,
    },
    {
      label: "Type Of Delivery ",
      name: "typeOfDelivery",
      type: "dropdown",
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblStuffingDestuffingType'",
      isEdit: true,
      required: true,
    },
    {
      label: "Free Days",
      name: "freeDays",
      isEdit: true,
      type: "checkbox",
    },
    {
      label: " Valid Till",
      name: "validTill",
      type: "date",
      isEdit: true,
    },
    {
      label: "Do Extension",
      name: "doExtension",
      isEdit: true,
      type: "checkbox",
    },
    {
      label: "High Sea Sales",
      name: "HighSeaSales",
      isEdit: true,
      type: "checkbox",
    },
    {
      label: " Request Date",
      name: "requestDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "Remarks",
      name: "remarks",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
    {
      label: "Rejection Remarks",
      name: "rejectionRemarks",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
    // { label: "Item No.", name: "itemNo", required: true },
    // { label: "IGM Date", name: "bookingReferenceNo", type: "date" },
    // { label: "Valid Till", name: "validTill", type: "date", required: true },
    // { label: "Sub Item No.", name: "subItemNo" },
    // {
    //   type: "radio",
    //   radioData: [
    //     { label: "RMS", value: "Y" },
    //     { label: "Non-RMS", value: "N" },
    //   ],
    // },
    // { label: "Examine Percentage", name: "examinePercentage" },
    // {
    //   label: "Delivery Mode",
    //   name: "deliveryMode",
    //   type: "dropdown",
    //   tableName: "tblMasterData m",
    //   idColumn: "id",
    //   displayColumn: "m.name",
    //   searchColumn: "m.name",
    //   orderBy: "m.name",
    //   where: "m.masterListName = 'tblMode'",
    //   isEdit: true,
    //   required: true,
    // },

    // { label: "Remarks", name: "remarks" },
  ],
  invoiceFields: [
    {
      label: "Name",
      name: "name",
      isEdit: true,
    },
    {
      label: "GSTIN/Provisional ID",
      name: "gstin",
      isEdit: true,
    },
    {
      label: "Address",
      name: "address",
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
      isEdit: true,
    },
    {
      label: "Contact",
      name: "contact",
      type: "number",
      isEdit: true,
    },
    {
      label: "Email",
      name: "name",
      isEdit: true,
    },
  ],
  attachmentFields: [
    {
      label: "Document Title",
      name: "documentTitle",
      isEdit: true,
    },
    {
      label: "Document Description",
      name: "documentDescription",
      isEdit: true,
    },
    {
      label: "Select Attachment",
      name: "selectAttachment",
      type: "fileupload",
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
