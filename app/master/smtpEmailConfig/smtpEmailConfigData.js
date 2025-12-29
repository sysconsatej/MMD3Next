import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const fieldData = {
  smtpFields: [
    {
      label: "Email id",
      name: "emailId",
      isEdit: true,
    },
    {
      label: "Password",
      name: "pwd",
      isEdit: true,
    },
    {
      label: "Host Name",
      name: "hostName",
      isEdit: true,
    },
    {
      label: "Port",
      name: "port",
      type: "number",
      isEdit: true,
    },
    {
      label: "SSL ",
      name: "isSSL",
      type: "checkbox",
      isEdit: true,
    },
  ],
  tblSMTPDetails: [
    {
      label: "Email To",
      name: "emailTo",
      isEdit: true,
    },
    {
      label: "Email Cc",
      name: "emailCc",
      isEdit: true,
    },
    {
      label: "Email Bcc",
      name: "emailBcc",
      isEdit: true,
    },
    {
      label: "Report Name",
      name: "reportId",
      type: "dropdown",
      tableName: "tblMenuButton",
      displayColumn: "menuName",
      foreignTable: "menuName,tblMenuButton",
      where: "menuType='R'",
      orderBy: "menuName",
      isEdit: true,
    },
  ],
};

export const cfs = [
  { label: "Custom Code", value: "p.ediPortCode" },
  { label: "Name", value: "p.name" },
  { label: "Nominated Area Code", value: "p.code" },
  { label: "Terminal Code", value: "p.ediCommonTerminalCode" },
  { label: "Bond No", value: "p.bondNo" },
  { label: "Address", value: "p.address" },
];

export default fieldData;
export const branchGridButtons = [
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
