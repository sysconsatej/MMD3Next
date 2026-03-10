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
      name: "consigneeId",
      type: "dropdown",
      tableName: "tbluser c",
      displayColumn: "c.name",
      orderBy: "c.name",
      joins: `join tblUser u1 on u1.id =c.roleCodeId and u1.name='Freight Forwarder/CHA  Agent' `,
      foreignTable: "name,tbluser",
      where: `c.userType='U' and c.status=1`,
      isEdit: true,
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
  { label: "Country Code", value: "code" },
  { label: "Country Name", value: "name" },
];

export default fieldData;
