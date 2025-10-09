import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const fieldData = {
  mblFields: [
    {
      label: "Location(POD)",
      name: "department",
      type: "dropdown",
      labelType: "port",
      required: true,
    },
    {
      label: "Liner/FF",
      name: "liner",
      type: "dropdown",
      labelType: "port",
      required: true,
    },
    {
      label: "MBL No",
      name: "mblNo",
      required: true,
    },
    {
      label: "MBL Date",
      name: "bookingReferenceNo",
      type: "date",
      required: true,
    },
    {
      label: "Vessel-Voyage No",
      name: "vesselVoyageNo",
      type: "dropdown",
      required: true,
    },
    {
      label: "Place of Delivery",
      name: "placeOfDelivery",
      required: true,
    },
    {
      label: "Delivery Type",
      name: "deliveryType",
      type: "dropdown",
      required: true,
    },
    {
      label: "CFS Type",
      name: "cfsType",
      type: "dropdown",
      required: true,
    },
    {
      label: "CFS Name",
      name: "cfsName",
      required: true,
    },
    {
      label: "Consignee Name",
      name: "consigneeName",
      required: true,
    },
    {
      label: "Nominated CB",
      name: "nominatedCb",
      required: true,
    },
    {
      label: "Status",
      name: "status",
      type: "dropdown",
      required: true,
    },
  ],
  attachmentFields: [
    {
      label: "Document Title",
      name: "documentTitle",
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
