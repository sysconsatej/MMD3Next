const fieldData = {
  voyageFields: [
    {
      label: "Port Of Call",
      name: "portOfCall",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Vessel No",
      name: "vesselNo",
      type: "dropdown",
      labelType: "vessel",
    },
    {
      label: "Voyage No",
      name: "voyageNo",
      type: "dropdown",
      labelType: "voyage",
      selectedCondition:"vesselNo",
    },
    {
      label: "Terminal",
      name: "terminal",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Voyage",
      name: "voyage",
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
      label: "Port Cut Off",
      name: "portCutOff",
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
      name: "nextPort",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Last Port",
      name: "lastPort",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Prior To Last Port",
      name: "priorToLastPort",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "Prior To Prior Port",
      name: "priorToPriorPort",
      type: "dropdown",
      labelType: "port",
    },
    {
      label: "SCR No",
      name: "scrNo",
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
      name: "noOfCrew",
    },
    {
      label: "Light House Due",
      name: "lightHouseDue",
    },

    { label: "Passenger List", name: "passengerList", type: "checkbox" },
    {
      label: "Same Bottom Cargo",
      name: "sameBottomCargo",
      type: "checkbox",
    },
    {
      label: "Ship Store Declaration",
      name: "shipStoreDeclaration",
      type: "checkbox",
    },
    {
      label: "Crew List Declaration",
      name: "crewListDeclaration",
      type: "checkbox",
    },
    {
      label: "Maritime Declaration",
      name: "maritimeDeclaration",
      type: "checkbox",
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
      rows: 4,
      gridColumn: "col-span-1 row-span-3 ",
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
