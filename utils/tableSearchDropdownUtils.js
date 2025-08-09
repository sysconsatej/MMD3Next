

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
  depot:[
    {label:"Location", value:"m.name"},
    {label:"Depot Code",value:"p.code"},
    {label:"Depot name",value:"p.name"},
    {label:"Address",value:"p.address"},
  ],
  vessel:[
    { label: " Code", value: "code" },
    { label: "Name", value: "name" },
  ],
  Commodity:[
    { label: " Code", value: "code" },
    { label: "Name", value: "name" },
  ],
  VoyageRoute:[
    {label:"Port of Call",value:"p.name"},
    {label:"VoyageId",value:"v.voyageId"},
    {label:"Vessel No",value:"ve.name"},
    {label:"IGM NO",value:"v.igmNo"},
    {label:"Export Locking",value:"v.exportLocking"},
    {label:"Import Locking",value:"v.importLocking"},
    {label:"Terminal",value:"p.name"},
    {label:"Voyage",value:"v.voyageNo"}
  ],
    typeOfCompany:[
    { label: " Code", value: "code" },
    { label: "Name", value: "name" },
  ],
company:[
  {label:"Code",value:"co.code"},
  {label:"Name",value:"co.name"},
  {label:"Country Name",value:"c.name" },
  {label:"State Name",value:"s.name"},
  {label:"City Name",value:"ci.name"},
  {label:"Phone No",value:"co.telephoneNo"},
  {label:"EmailId",value:"co.emailId "},
  {label:"Pan No",value:"co.panNo "},
  {label:"GSTIN No",value:"co.taxRegistrationNo"},

]


};
