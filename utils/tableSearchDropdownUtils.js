import ContainerStatus from "@/app/master/containerStatus/page";

export const dropdowns = {
  country: [
    { label: "Country Code", value: "code" },
    { label: "Country Name", value: "name" },
    ],
  state: [
    { label: "Code", value: "s.code" },
    { label: "Tax State Code", value: "s.taxStateCode" },
    { label: "Name", value: "s.name" },
    { label: "Country Name", value: "c.name" },
  ],
  city:[
    {label:"City Name" ,value:"c.name"},
    {label:"State Name",value:"s.name"},
    {label:"Country Name",value:"co.name"},
  ],
  port:[
    {label:"Code",value:"p.code"},
    {label:"Port Name",value:"p.name"},
    {label:"ActiveInactive",value:"p.activeInactive"},
    {label:"Port Type Name",value:"m.name"},
    {label:"Country",value:"c.name"}
  ],
   
  ContainerStatus: [
    { label: "Country Code", value: "code" },
    { label: "Country Name", value: "name" },
    ],


};
