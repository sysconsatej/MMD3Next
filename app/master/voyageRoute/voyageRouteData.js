const fieldData = {
  voyageFields: [
    {
      label: "Port Of Call",
      name: "portOfCallId",
      type: "dropdown",
      labelType: "port",
      foreignTable: "name,tblPort",
    },
    {
      label: "Vessel Name",
      name: "vesselId",
      type: "dropdown",
      labelType: "vessel",
      foreignTable: "name,tblVessel",
    },
    {
      label: "Voyage No",
      name: "voyageId",
      type: "dropdown",
      labelType: "voyage",
      selectedCondition: "vesselId",
      foreignTable: "voyageNo,tblVoyage",
    },
    {
      label: "Terminal",
      name: "berthId",
      type: "dropdown",
      labelType: "port",
      foreignTable: "name,tblPort",
    },
    {
      label: "Export Voyage No",
      name: "exportVoyageNo",
    },
    {
      label: "Import Voyage No",
      name: "importVoyageNo",
    },
    {
      label: "ETA",
      name: "eta",
      type: "date",
    },
    {
      label: "ETD",
      name: "etd",
      type: "date",
    },
    {
      label: "ETB",
      name: "etb",
    },
    {
      label: "Port Cut Off",
      name: "portCutoff",
      type: "date",
    },
  ],
  portFields: [
    {
      label: "Arrival Date",
      name: "arrivalDate",
      type: "date",
    },
    {
      label: "ATB",
      name: "berthDate",
    },
    {
      label: "Sail Date",
      name: "sailDate",
      type: "date",
    },
    {
      label: "ETA Next Port",
      name: "etaNextPort",
      type: "date",
    },
    {
      label: "Next Port",
      name: "nextPortId",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Last Port",
      name: "lastPortId",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Prior To Last Port",
      name: "priorToLastPortId",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Prior To Prior Port",
      name: "priorToPriorPortId",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "SCR No",
      name: "scrNo",
    },
    {
      label: "Empty Depot",
      name: "depotId",
    },
  ],
  dateFields: [
    { label: "IGM No", name: "igmNo", type: "text" },
    {
      label: "IGM Date",
      name: "igmDate",
      type: "date",
    },
    { label: "Rotation No", name: "rotationNo", type: "text" },
    {
      label: "Rotation Date",
      name: "rotationDate",
      type: "date",
    },
    {
      label: "PC NO",
      name: "pcNo",
      type: "text",
    },
    {
      label: "PC Date",
      name: "pcDate",
      type: "date",
    },
    {
      label: "Via No",
      name: "viaNo",
      type: "text",
    },
    {
      label: "Via Date",
      name: "viaDate",
      type: "date",
    },
  ],
  consignorFields: [
    {
      label: "NO of Crew",
      name: "noOFCrew",
    },
    {
      label: "Light House Due",
      name: "lightHouseDues",
    },

    {
      label: "Passenger List",
      name: "passengerList",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label: "Same Bottom Cargo",
      name: "sameBottomCargo",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label: "Ship Store Declaration",
      name: "shipStoresDeclaration",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label: "Crew List Declaration",
      name: "crewListDeclaration",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label: "Maritime Declaration",
      name: "maritimeDeclaration",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label: "Export Locking",
      name: "exportLocking",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
  ],
  additionalFields: [
    {
      label: "Cargo Description",
      name: "cargoDescription",
      style: "sm:w-[min(100%,300px)]",
      multiline: true,
      rows: 1,
      type: "textarea",
      isEdit: true,
    },
    {
      label: "Import Locking",
      name: "importLocking",
      type: "radio",
      radioData: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
    {
      label: "Auth. Person Pan No",
      name: "authPersonPanNo",
    },
    {
      label: "Ships Store IRN",
      name: "shipsStoreIrn",
    },
    {
      label: "Crew Effect IRN",
      name: "crewEffectIrn",
    },
    {
      label: "Person Details IRN",
      name: "personDetailsIrn",
    },
  ],
};

export default fieldData;
