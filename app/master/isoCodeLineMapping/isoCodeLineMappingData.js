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
      label: "Iso Code",
      name: "isocodeId",
      type: "dropdown",
      tableName: "tblIsocode c",
      displayColumn: "c.isocode",
      orderBy: "c.isocode",
      foreignTable: "isocode,tblIsocode",
      isEdit: true,
    },
    {
      label: "Line Iso Code",
      name: "lineIsocode",
      isEdit: true,
    },
  ],
};

export const country = [
  { label: "Shipping Line", value: "s.name" },
  { label: "ISO Code", value: "iso.isocode" },
  { label: "Line ISO Code", value: "i.lineIsoCode" },
  { label: "Updated By", value: "u4.name" },
];

export default fieldData;
