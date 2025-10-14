import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const fieldData = {
  mblFields: [
    {
      label: "Location(POD)",
      name: "department",
      type: "dropdown",
      tableName: "tblPort t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      required: true,
      isEdit: true
    },
    {
      label: "Liner/FF",
      name: "liner",
      type: "dropdown",
      tableName: "tblCompany t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      required: true,
      isEdit: true
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
      tableName: "tblVoyage v",
      idColumn: "id",
      displayColumn: "ISNULL(ve.name,'') + ' - ' + ISNULL(v.voyageNo,'')",
      joins: "JOIN tblVessel ve ON ve.id = v.vesselId",
      searchColumn: "ve.name, v.voyageNo",
      orderBy: "ve.name, v.voyageNo",
      required: true,
      isEdit: true
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
      tableName: "tblMasterData m",
      idColumn: "id",
      displayColumn: "m.name",
      searchColumn: "m.name",
      orderBy: "m.name",
      where: "m.masterListName = 'tblStuffingDestuffingType'",
      required: true,
      isEdit: true
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
