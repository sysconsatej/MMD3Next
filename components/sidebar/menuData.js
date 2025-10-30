// components/sidebar/menuData.js
// Parent items can specify an `icon` string: "home" | "cube" | "file" | "inbox" | "chart"
// Only parent level renders icons; children render text-only.

export const navItems = [
  { name: "Home", href: "/home", icon: "home", isShow: true ,},
  {
    name: "Master",
    icon: "cube",
    isShow: false,
    submenu: [
      { name: "Company", href: "/master/company/list", isShow: false },
      {
        name: "Container Size",
        href: "/master/containerSize/list",
        isShow: false,
      },
      {
        name: "Container Status",
        href: "/master/containerStatus/list",
        isShow: false,
      },
      {
        name: "Container Type",
        href: "/master/containerType/list",
        isShow: false,
      },
      { name: "CFS", href: "/master/cfs/list", isShow: false },
      { name: "Empty Depot", href: "/master/depot/list", isShow: false },
      { name: "ISO Code", href: "/master/isoCode/list", isShow: false },
      { name: "HAZ Details", href: "/master/imo/list", isShow: false },
      { name: "Item Type", href: "/master/itemType/list", isShow: false },
      { name: "Cargo Type", href: "/master/cargoType/list", isShow: false },
      { name: "Country", href: "/master/country/list", isShow: false },
      { name: "State", href: "/master/state/list", isShow: false },
      { name: "City", href: "/master/city/list", isShow: false },
      { name: "Vessel", href: "/master/vessel/list", isShow: false },
      { name: "Voyage Route", href: "/master/voyageRoute/list", isShow: false },
      { name: "Voyage", href: "/master/voyage/list", isShow: false },
      { name: "Port", href: "/master/port/list", isShow: false },
      { name: "Terminal", href: "/master/terminal/list", isShow: false },
      { name: "Dpd", href: "/master/dpd/list", isShow: false },
      {
        name: "Type Of Company",
        href: "/master/typeOfCompany/list",
        isShow: false,
      },
      { name: "Package Type", href: "/master/packageType/list", isShow: false },
      { name: "User", href: "/master/user/list", isShow: false },
      { name: "Unit", href: "/master/unit/list", isShow: false },
      { name: "Unit Type", href: "/master/unitType/list", isShow: false },
      {
        name: "Mode Of Transport",
        href: "/master/modeOfTransport/list",
        isShow: false,
      },
      {
        name: "Movement Type",
        href: "/master/movementType/list",
        isShow: false,
      },
    ],
  },

  {
    name: "BL",
    icon: "file",
    isShow: false,
    submenu: [
      {
        name: "HBL",
        isShow: false,
        children: [
          {
            name: "HBL Request",
            href: "/bl/hbl/list",
            isShow: false,
          },
          {
            name: "HBL Upload",
            href: "/bl/hbl/upload",
            isShow: false,
          },
        ],
      },
      {
        name: "MBL",
        isShow: false,
        children: [
          {
            name: "MBL Request",
            href: "/bl/mbl/list",
            isShow: false,
          },
          {
            name: "MBL Upload",
            href: "/bl/mbl/upload",
            isShow: false,
          },
        ],
      },
    ],
  },

  {
    name: "Invoice",
    icon: "inbox",
    isShow: false,
    submenu: [
      {
        name: "Invoice Request",
        href: "/request/invoiceRequest/list",
        isShow: false,
      },
      {
        name: "Invoice Upload",
        href: "/request/invoiceUpload/list",
        isShow: false,
      },
    ],
  },

  {
    name: "Reports",
    icon: "chart",
    href: "/reports",
    isShow: false,
    submenu: [
      {
        name: "Customs And Port",
        href: "/reports/customsAndPort",
        isShow: false,
        children: [
          {
            name: "Import Advance List(Excel)",
            href: "/reports/customAndPort/importAdvanceListExcel",
            isShow: false,
          },
          {
            name: "Import Advance List(Text)",
            href: "/reports/customAndPort/importAdvanceListText",
            isShow: false,
          },
          {
            name: "IGM EDI 1.5",
            href: "/reports/customAndPort/igmEdi",
            isShow: false,
          },
          {
            name: "IGM REPORT FORM III",
            href: "/reports/customAndPort/igmReportForm",
            isShow: false,
          },
          {
            name: "SCMTR-SAM",
            href: "/reports/customAndPort/scmtrSam",
            isShow: false,
          },
          {
            name: "SCMTR-SEI",
            href: "/reports/customAndPort/scmtrSei",
            isShow: false,
          },
          {
            name: "SCMTR-CSN",
            href: "/reports/customAndPort/scmtrCsn",
            isShow: false,
          },
          {
            name: "Cargo Arrival Notice",
            href: "/reports/customAndPort/cargoArrivalNotice",
            isShow: false,
          },
          {
            name: "Update CFS DPD",
            href: "/reports/customAndPort/updateCfsDpd",
            isShow: false,
          },
          {
            name: "Update Line No",
            href: "/reports/customAndPort/updateLineNumber",
            isShow: false,
          },
          {
            name: "Update Vessel/Voyage",
            href: "/reports/customAndPort/updateVesselVoyage",
            isShow: false,
          },
          {
            name: "Shipping Bill",
            href: "/reports/customAndPort/shippingBill",
            isShow: false,
          },
        ],
      },
    ],
  },
];
