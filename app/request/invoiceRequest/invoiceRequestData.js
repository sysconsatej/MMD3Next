import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const fieldData = {
  igmFields: [
    {
      label: "CFS Name",
      name: "cfsName",
      type: "dropdown",
      labelType: "cfsName",
      required: true,
    },
    {
      label: "IGM Location",
      name: "igmLocation",
      type: "dropdown",
      labelType: "igmLocation",
      required: true,
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
      labelType: "deliveryMode",
      required: true,
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
