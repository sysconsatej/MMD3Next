import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const fieldData = {
  userFields: [
    {
      label: "User Name",
      name: "name",
      isEdit: "true",
      required: true,
    },
    {
      label: "Password",
      name: "password",
      isEdit: "true",
      required: true,
    },
    {
      label: "Email Address",
      name: "emailId",
      isEdit: "true",
      required: true,
    },
    {
      label: "Company",
      name: "companyId",
      type: "dropdown",
      tableName: "tblCompany t",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      foreignTable: "name,tblCompany",
      isEdit: true,
      required: true,
    },
    {
      label: "Company Branch",
      name: "branchId",
      type: "dropdown",
      tableName: "tblCompanyBranch t",
      displayColumn: "t.name",
      selectedConditions: [{ companyId: "companyId" }],
      orderBy: "t.name",
      foreignTable: "name,tblCompanyBranch",
      isEdit: true,
      required: true,
    },
    {
      label: "Select Role",
      name: "roleCodeId",
      type: "dropdown",
      tableName: "tblUser  u",
      orderBy: "u.name",
      foreignTable: "name,tblUser",
      isEdit: true,
      required: true,
      where: "u.userType='R'",
      changeFun: "getUserGroupBasedonRole",
      
    },
  ],
  tblUserRoleMapping: [
    {
      label: "Role",
      name: "roleId",
      type: "dropdown",
      tableName: "tblUser u",
      foreignTable: "name,tblUser",
      displayColumn: "u.name",
      where: "u.userType = 'S'",
      orderBy: "u.name",
      isEdit: true,
      required: true,
      // changeFun: "changeDuplicateValue",
    },
  ],
  tblUserLocation: [
    {
      label: "Location",
      name: "locationId",
      type: "dropdown",
      tableName: "tblLocation l",
      foreignTable: "name,tblLocation",
      displayColumn: "l.name",
      where: "",
      orderBy: "l.name",
      isEdit: true,
      required: true,
    },
  ],
};

export const user = [
  { label: "Name", value: "u.name" },
  { label: "Email Id", value: "u.emailId" },
];

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



