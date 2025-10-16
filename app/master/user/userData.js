import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
const fieldData = {
  userFields: [
    {
      label: "User Name",
      name: "name",
      isEdit: "true",
    },
    {
      label: "Password",
      name: "password",
      isEdit: "true",
    },
    {
      label: "Email Address",
      name: "emailId",
      isEdit: "true",
    },
    {
      label: "Company",
      name: "companyId",
      type: "dropdown",
      tableName: "tblCompany t",
      idColumn: "id",
      displayColumn: "t.name",
      searchColumn: "t.name",
      orderBy: "t.name",
      isEdit: true,
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
      where: "u.userType = 'R'",
      orderBy: "u.name",
      isEdit: true,
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
