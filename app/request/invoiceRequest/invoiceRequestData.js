import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const fieldData = {
  igmFields: [
    {
      label: "CFS Name",
      name: "cfsName",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.name",
      joins: "JOIN tblMasterData m ON m.id = t.portTypeId AND m.name = 'CONTAINER FREIGHT STATION'",
      searchColumn: "t.name",
      orderBy: "t.name",
      labelType: "cfs",
      required: true,
      isEdit: true
    },
    {
      label: "IGM Location",
      name: "igmLocation",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      labelType: "port",
      required: true,
      isEdit: true
    },
    { label: "IGM No.", name: "igmNo", required: true },
    { label: "Item No.", name: "itemNo", required: true },
    { label: "IGM Date", name: "bookingReferenceNo", type: "date" },
    { label: "Valid Till", name: "validTill", type: "date", required: true },
    { label: "Sub Item No.", name: "subItemNo" },
    {
      type: "radio",
      radioData: [
        { label: "RMS", value: "Y" },
        { label: "Non-RMS", value: "N" },
      ],
    },
    { label: "Examine Percentage", name: "examinePercentage" },
    {
      label: "Delivery Mode",
      name: "deliveryMode",
      type: "dropdown",
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblMode'",
      labelType: "name,tblMode",
      isEdit: true,
      required: true
    },
    { label: "GSTIN/Provisional ID", name: "gstin" },
    { label: "Remarks", name: "remarks" },
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
