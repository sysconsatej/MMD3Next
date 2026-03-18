import { getUserByCookies } from "@/utils";

const userData = getUserByCookies();
const fieldData = {
  countryFields: [
    {
      label: "Shipping Line",
      name: "shippingLineId",
      type: "dropdown",
      isEdit: true,
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
      label: "Consignee ",
      name: "consignee",
      isEdit: true,
    },
    {
      label: "Consignee Pan",
      name: "consigneePan",
      isEdit: true,
      blurFun: "validatePanCard",
    },
    {
      label: "Cfs Name",
      name: "cfsId",
      type: "dropdown",
      tableName: "tblPort p",
      displayColumn: "ISNULL(p.code,'') + ' - ' + ISNULL(p.name,'')",
      joins: `join tblMasterData m on m.id = p.portTypeId  
            and m.masterListName = 'tblPortType' 
            and m.code = 'CFS' 
            and p.companyId = '${userData?.companyId}' 
            left join tblLocation l on l.id = ${userData?.location} 
            join tblPort p1 on p1.id = p.referencePortId 
            and l.name = p1.name `,
      isEdit: true,
      foreignTable: "code-name,tblPort",
    },

    {
      name: "activeInactive",
      type: "radio",
      radioData: [
        { label: "Active", value: "Y" },
        { label: "Inactive", value: "N" },
      ],
      isEdit: true,
    },
  ],
};

export const country = [
  { label: "Shipping Line", value: "s.name" },
  { label: "Location", value: "l.name" },
  { label: "Consignee", value: "c.consignee" },
  { label: "Consignee Pan", value: "c.consigneePan" },

  {
    label: "CFS",
    value: "ISNULL(cfs.name,'') + '-' + ISNULL(cfs.code,'')",
  },
  {
    label: "Active",
    value: "c.activeInactive",
  },
  { label: "Updated By", value: "up.name" },
];
export default fieldData;
