import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();

// input fields data
export const fieldData = {
  berthAgentFields: [
    {
      label: "Shipping Line",
      name: "shippingLineId",
      type: "dropdown",
      isEdit: true,
      required: true,
      // query
      tableName: "tblCompany c",
      displayColumn: "c.name",
      orderBy: "c.name",
      foreignTable: "name,tblCompany",
      where:
        userData?.roleCode === "shipping"
          ? `c.id  = '${userData?.companyId}'`
          : "",
    },
    {
      label: "Report Name ",
      name: "reportsId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblReportType'",
      orderBy: "m.name",
      isEdit: true,
      foreignTable: "name,tblMasterData",
      changeFun: "duplicateReportCheck",
      required: true,
    },
    {
      label: "Terms and condition",
      name: "termsAndCondition",
      type: "textarea",
      isEdit: true,
      required: true,
    },
  ],
};

// search array
export const searchDataAray = [
  {
    label: "Shipping Line",
    value: "s.name",
  },
  {
    label: "Terms and Condition",
    value: "c.termsAndCondition",
  },
  {
    label: "Report Name",
    value: "m.name",
  },
  {
    label: "Updated By",
    value: "u.name",
  },
];
