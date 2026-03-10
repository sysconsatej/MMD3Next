import { getUserByCookies } from "@/utils";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const userData = getUserByCookies();

export const fieldData = {
  doFields: [
    {
      label: "MBL No",
      name: "mblNo",
      isEdit: true,
      disabled: true,
    },
    {
      label: "MBL Date",
      name: "mblDate",
      type: "date",
      isEdit: true,
      disabled: true,
    },
    {
      label: "HBL No",
      name: "hblNo",
      isEdit: true,
      disabled: true,
    },
    {
      label: "HBL Date",
      name: "hblDate",
      type: "date",
      isEdit: true,
      disabled: true,
    },
    {
      label: "Vessel",
      name: "podVesselId",
      type: "dropdown",
      displayColumn: "t.name",
      searchColumn: "t.name",
      tableName: "tblVessel t",
      joins: `left join tblLocation l on l.id = ${userData?.location} left JOIN tblVoyageRoute vr ON vr.vesselId = t.id left join tblPort p on p.id = vr.portOfCallId `,
      where: ` GETDATE() >= vr.gateOpenLine AND GETDATE() < vr.gateCloseLine and p.name = l.name `,
      orderBy: "t.name",
      foreignTable: "name,tblVessel",
      changeFun: "handleDropdownChange",
      isEdit: true,
      disabled: true,
    },
    {
      label: "Voyage",
      name: "podVoyageId",
      type: "dropdown",
      tableName: "tblVoyage t",
      idColumn: "id",
      displayColumn: "t.voyageNo",
      searchColumn: "t.voyageNo",
      selectedConditions: [{ podVesselId: "vesselId" }],
      where: ` t.status = 1`,
      orderBy: "t.voyageNo",
      foreignTable: "voyageNo,tblVoyage",
      isEdit: true,
      disabled: true,
    },
    {
      label: "Clearing Agent",
      name: "customBrokerText",
      isEdit: true,
    },
    {
      label: "Depot",
      name: "emptyDepotId",
      isEdit: true,
      type: "dropdown",
      displayColumn: "p.name",
      tableName: "tblPort p",
      joins: `join tblMasterData m on m.id = p.portTypeId and m.name = 'DEPOT' and m.masterListName = 'tblPortType' and p.status = 1`,
      where: `p.companyId = ${userData?.companyId}`,
      orderBy: "p.name",
      foreignTable: "name,tblPort",
    },
    {
      label: "Surveyor Name",
      name: "surveyorId",
      isEdit: true,
    },
    {
      label: "DO Date",
      name: "doDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "DO Validity Date",
      name: "doValidDate",
      type: "date",
      isEdit: true,
    },
    {
      label: "HSS",
      name: "hss",
      isEdit: true,
      type: "radio",
      radioData: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      changeFun: "hssChangeHandler",
    },
    {
      label: "HSS Customer Name",
      name: "newConsigneeText",
      isEdit: true,
    },
    {
      label: "HSS Customer Address",
      name: "newConsigneeAddress",
      isEdit: true,
      type: "textarea",
      rows: 2,
      gridColumn: "col-span-2 row-span-1 ",
    },
  ],

  tblBlContainer: [
    {
      label: "Select For DO",
      name: "selectForDO",
      type: "checkbox",
      isEdit: true,
    },
    {
      label: "CONTAINER NO",
      name: "containerNo",
      isEdit: true,
      required: true,
      disabled: true,
    },
    {
      label: "Size",
      name: "sizeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "m.name",
      where: "m.masterListName = 'tblSize'",
      orderBy: "m.name",
      foreignTable: "name,tblMasterData",
      isEdit: true,
      changeFun: "setISOBySize",
      disabled: true,
    },
    {
      label: "Type",
      name: "typeId",
      type: "dropdown",
      tableName: "tblMasterData m",
      displayColumn: "ISNULL(m.code,'') + ' - ' + ISNULL(m.name,'')",
      where: "m.masterListName = 'tblType'",
      orderBy: "m.name",
      foreignTable: "code-name,tblMasterData",
      isEdit: true,
      changeFun: "setISOByType",
      disabled: true,
    },
    {
      label: " Valid Till",
      name: "doValidityDate",
      type: "date",
      isEdit: true,
    },
  ],
};
export const cfsGridButtons = [
  { text: "Add", icon: <AddIcon />, func: "gridAddHandler" },
  { text: "Delete", icon: <CloseIcon />, func: "gridDeleteHandler" },
];

export const advanceSearchFields = {
  bl: [
    {
      label: "BL No",
      name: "blNo",
      isEdit: true,
    },
  ],
};
