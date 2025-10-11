import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const fieldData = {
  vesselFields: [
    {
      label: "Code",
      name: "code",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "Name",
      name: "name",
      isEdit: true,
      required: true,
      blurFun: "duplicateHandler",
    },
    {
      label: "IMO Code",
      name: "imoCode",
      isEdit: true,
    },
    {
      label: "Nationality",
      name: "nationalityId",
      type: "dropdown",
      tableName: "tblCountry",
      displayColumn: "t.name",
      orderBy: "t.name",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: true,
    },
    {
      label: "Call Sign",
      name: "callSign",
      isEdit: true,
    },
    {
      label: "Build Year",
      name: "buildYear",
      type: "number",
      isEdit: true,
    },
    {
      label: "Gross Tonnage",
      name: "grossTonnage",
      type: "number",
      isEdit: true,
    },
    {
      label: "Net Tonnage",
      name: "netTonnage",
      type: "number",
      isEdit: true,
    },
  ],
  tblVoyage: [
    {
      label: "Voyage No",
      name: "voyageNo",
      isEdit: true,
    },
    {
      label: "Master",
      name: "masterName",
      isEdit: true,
    },
    {
      label: "Master Nationality",
      name: "masterNationalityId",
      type: "dropdown",
      tableName: "tblCountry",
      displayColumn: "t.name",
      orderBy: "t.name",
      labelType: "country",
      foreignTable: "name,tblCountry",
      isEdit: true,
    },
    {
      label: "Dc No",
      name: "masterIdNo",
      isEdit: true,
    },
    {
      label: "Convey Reference No",
      name: "conveyRefNo",
      isEdit: true,
    },
  ],
};

export const vessel = [
  { label: " Code", value: "v.code" },
  { label: "Name", value: "v.name" },
  { label: "Nationality", value: "c.name" },
  { label: "CallSign", value: "v.callSign" },
  { label: "ImoCode", value: "v.imoCode" },
];

export default fieldData;

export const voyageGridButtons = [
  {
    text: "Add Row",
    icon: <AddIcon />,
    func: "gridAddHandler",
  },
  {
    text: "Delete Row",
    icon: <CloseIcon />,
    func: "gridDeleteHandler",
  },
  {
    text: "Copy Row",
    icon: <FileCopyIcon />,
    func: "gridCopyHandler",
  },
  {
    text: "Import Excel",
    icon: <UploadFileIcon />,
    func: "checkHandler",
  },
];
