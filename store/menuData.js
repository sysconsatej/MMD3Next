export const navItems = [
  {
    id: 1,
    menuName: "Home",
    menuLink: "/home",
    icon: "home",
    isChecked: false, // Added isChecked for parent
  },

  {
    id: 2,
    menuName: "Master",
    // icon: "cube",
    isChecked: false, // Added isChecked for parent
    subMenu: [
      {
        id: 3,
        menuName: "Commodity",
        menuLink: "/master/commodity/list",
        isChecked: false,
      },
      {
        id: 4,
        menuName: "Company",
        menuLink: "/master/company/list",
        isChecked: false,
      },
      {
        id: 5,
        menuName: "Company Branch",
        menuLink: "/master/companyBranch/list",
        isChecked: false,
      },
      {
        id: 6,
        menuName: "Container Size",
        menuLink: "/master/containerSize/list",
        isChecked: false,
      },
      {
        id: 7,
        menuName: "Container Status",
        menuLink: "/master/containerStatus/list",
        isChecked: false,
      },
      {
        id: 8,
        menuName: "Container Type",
        menuLink: "/master/containerType/list",
        isChecked: false,
      },
      {
        id: 9,
        menuName: "CFS",
        menuLink: "/master/cfs/list",
        isChecked: false,
      },
      {
        id: 10,
        menuName: "Depot",
        menuLink: "/master/depot/list",
        isChecked: false,
      },
      {
        id: 11,
        menuName: "ISO Code",
        menuLink: "/master/isoCode/list",
        isChecked: false,
      },
      {
        id: 12,
        menuName: "HAZ Details",
        menuLink: "/master/imo/list",
        isChecked: false,
      },
      {
        id: 13,
        menuName: "Item Type",
        menuLink: "/master/itemType/list",
        isChecked: false,
      },
      {
        id: 14,
        menuName: "Cargo Type",
        menuLink: "/master/cargoType/list",
        isChecked: false,
      },
      {
        id: 15,
        menuName: "Country",
        menuLink: "/master/country/list",
        isChecked: false,
        buttonTypes: [
          { btnName: "Add", status: false },
          { btnName: "Edit", status: false },
          { btnName: "View", status: false },
          { btnName: "Delete", status: false },
          { btnName: "Search", status: false },
        ],
      },
      {
        id: 16,
        menuName: "State",
        menuLink: "/master/state/list",
        isChecked: false,
      },
      {
        id: 17,
        menuName: "City",
        menuLink: "/master/city/list",
        isChecked: false,
      },
      {
        id: 18,
        menuName: "Vessel",
        menuLink: "/master/vessel/list",
        isChecked: false,
      },
      {
        id: 19,
        menuName: "Voyage Route",
        menuLink: "/master/voyageRoute/list",
        isChecked: false,
      },
      {
        id: 20,
        menuName: "Voyage",
        menuLink: "/master/voyage/list",
        isChecked: false,
      },
      {
        id: 21,
        menuName: "Port",
        menuLink: "/master/port/list",
        isChecked: false,
      },
      {
        id: 22,
        menuName: "Nominated Area",
        menuLink: "/master/nominatedArea/list",
        isChecked: false,
      },
      {
        id: 23,
        menuName: "Terminal",
        menuLink: "/master/terminal/list",
        isChecked: false,
      },
      {
        id: 24,
        menuName: "Dpd",
        menuLink: "/master/dpd/list",
        isChecked: false,
      },
      {
        id: 25,
        menuName: "Type Of Company",
        menuLink: "/master/typeOfCompany/list",
        isChecked: false,
      },
      {
        id: 26,
        menuName: "Package Type",
        menuLink: "/master/packageType/list",
        isChecked: false,
      },
      {
        id: 27,
        menuName: "User",
        menuLink: "/master/user/list",
        isChecked: false,
      },
      {
        id: 28,
        menuName: "Unit",
        menuLink: "/master/unit/list",
        isChecked: false,
      },
      {
        id: 29,
        menuName: "Unit Type",
        menuLink: "/master/unitType/list",
        isChecked: false,
      },
      {
        id: 30,
        menuName: "SMTP",
        menuLink: "/master/smtpCarrier/list",
        isChecked: false,
      },
      {
        id: 31,
        menuName: "Mode Of Transport",
        menuLink: "/master/modeOfTransport/list",
        isChecked: false,
      },
      {
        id: 32,
        menuName: "Movement Type",
        menuLink: "/master/movementType/list",
        isChecked: false,
      },
    ],
  },

  {
    id: 33,
    menuName: "BL",
    icon: "file",
    isChecked: false, // Added isChecked for parent
    subMenu: [
      {
        id: 34,
        menuName: "HBL Request",
        menuLink: "/bl/hbl/list",
        isChecked: false,
      },
      {
        id: 35,
        menuName: "MBL Request",
        menuLink: "/bl/mbl/list",
        isChecked: false,
      },
    ],
  },

  {
    id: 36,
    menuName: "Requests",
    icon: "inbox",
    isChecked: false, // Added isChecked for parent
    subMenu: [
      {
        id: 37,
        menuName: "CFS Request For Invoice",
        menuLink: "/request/invoiceRequest/list",
        isChecked: false,
      },
      {
        id: 38,
        menuName: "CFS Request For Container",
        menuLink: "/request/cfsRequest/list",
        isChecked: false,
      },
    ],
  },

  {
    id: 39,
    menuName: "Reports",
    icon: "chart",
    menuLink: "/reports",
    isChecked: false, // Added isChecked for parent
    subMenu: [
      {
        id: 40,
        menuName: "Customs And Port",
        menuLink: "/reports/customsAndPort",
        isChecked: false, // Added isChecked for parent
        subMenu: [
          {
            id: 41,
            menuName: "Import Advance List(Excel)",
            menuLink: "/reports/customAndPort/importAdvanceListExcel",
            isChecked: false,
          },
          {
            id: 42,
            menuName: "Import Advance List(Text)",
            menuLink: "/reports/customAndPort/importAdvanceListText",
            isChecked: false,
          },
          {
            id: 43,
            menuName: "IGM EDI 1.5",
            menuLink: "/reports/customAndPort/igmEdi",
            isChecked: false,
          },
          {
            id: 44,
            menuName: "IGM REPORT FORM III",
            menuLink: "/reports/customAndPort/igmReportForm",
            isChecked: false,
          },
          {
            id: 45,
            menuName: "SCMTR-SAM",
            menuLink: "/reports/customAndPort/scmtrSam",
            isChecked: false,
          },
          {
            id: 46,
            menuName: "SCMTR-SEI",
            menuLink: "/reports/customAndPort/scmtrSei",
            isChecked: false,
          },
          {
            id: 47,
            menuName: "SCMTR-CSN",
            menuLink: "/reports/customAndPort/scmtrCsn",
            isChecked: false,
          },
          {
            id: 48,
            menuName: "Cargo Arrival Notice",
            menuLink: "/reports/customAndPort/cargoArrivalNotice",
            isChecked: false,
          },
          {
            id: 49,
            menuName: "Update CFS DPD",
            menuLink: "/reports/customAndPort/updateCfsDpd",
            isChecked: false,
          },
          {
            id: 50,
            menuName: "Update Line No",
            menuLink: "/reports/customAndPort/updateLineNumber",
            isChecked: false,
          },
          {
            id: 51,
            menuName: "Shipping Bill",
            menuLink: "/reports/customAndPort/shippingBill",
            isChecked: false,
          },
        ],
      },
    ],
  },
];
