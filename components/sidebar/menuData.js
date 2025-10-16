// components/sidebar/menuData.js
// Parent items can specify an `icon` string: "home" | "cube" | "file" | "inbox" | "chart"
// Only parent level renders icons; children render text-only.

export const navItems = [
  { name: "Home", href: "/", icon: "home" },

  {
    name: "Master",
    icon: "cube",
    submenu: [
      { name: "Commodity", href: "/master/commodity/list" },
      { name: "Company", href: "/master/company/list" },
      { name: "Company Branch", href: "/master/companyBranch/list" },
      { name: "Container Size", href: "/master/containerSize/list" },
      { name: "Container Status", href: "/master/containerStatus/list" },
      { name: "Container Type", href: "/master/containerType/list" },
      { name: "CFS", href: "/master/cfs/list" },
      { name: "Depot", href: "/master/depot/list" },
      { name: "ISO Code", href: "/master/isoCode/list" },
      { name: "HAZ Details", href: "/master/imo/list" },
      { name: "Item Type", href: "/master/itemType/list" },
      { name: "Cargo Type", href: "/master/cargoType/list" },
      { name: "Country", href: "/master/country/list" },
      { name: "State", href: "/master/state/list" },
      { name: "City", href: "/master/city/list" },
      { name: "Vessel", href: "/master/vessel/list" },
      { name: "Voyage Route", href: "/master/voyageRoute/list" },
      { name: "Voyage", href: "/master/voyage/list" },
      { name: "Port", href: "/master/port/list" },
      { name: "Terminal", href: "/master/terminal/list" },
      { name: "Dpd", href: "/master/dpd/list" },
      { name: "Type Of Company", href: "/master/typeOfCompany/list" },
      { name: "Package Type", href: "/master/packageType/list" },
      { name: "User", href: "/master/user/list" },
      { name: "Unit", href: "/master/unit/list" },
      { name: "Unit Type", href: "/master/unitType/list" },
      { name: "SMTP", href: "/master/smtpCarrier/list" },
      { name: "Mode Of Transport", href: "/master/modeOfTransport/list" },
      { name: "Movement Type", href: "/master/movementType/list" },
    ],
  },

  {
    name: "BL",
    icon: "file",
    submenu: [
      { name: "HBL Request", href: "/bl/hbl/list" },
      { name: "MBL Request", href: "/bl/mbl/list" },
    ],
  },

  {
    name: "Requests",
    icon: "inbox",
    submenu: [
      { name: "Invoice Request", href: "/request/invoiceRequest/list" },
    ],
  },

  {
    name: "Reports",
    icon: "chart",
    href: "/reports",
    submenu: [
      {
        name: "Customs And Port",
        href: "/reports/customsAndPort",
        children: [
          {
            name: "Import Advance List(Excel)",
            href: "/reports/customAndPort/importAdvanceListExcel",
          },
          {
            name: "Import Advance List(Text)",
            href: "/reports/customAndPort/importAdvanceListText",
          },
          { name: "IGM EDI 1.5", href: "/reports/customAndPort/igmEdi" },
          {
            name: "IGM REPORT FORM III",
            href: "/reports/customAndPort/igmReportForm",
          },
          { name: "SCMTR-SAM", href: "/reports/customAndPort/scmtrSam" },
          { name: "SCMTR-SEI", href: "/reports/customAndPort/scmtrSei" },
          { name: "SCMTR-CSN", href: "/reports/customAndPort/scmtrCsn" },
          {
            name: "Cargo Arrival Notice",
            href: "/reports/customAndPort/cargoArrivalNotice",
          },
          {
            name: "Update CFS DPD",
            href: "/reports/customAndPort/updateCfsDpd",
          },
          {
            name: "Update Line No",
            href: "/reports/customAndPort/updateLineNumber",
          },
          {
            name: " Shipping Bill",
            href: "/reports/customAndPort/shippingBill",
          },
        ],
      },
    ],
  },
];
