import { Label } from "@mui/icons-material";

const fieldData = {
  nominatedAreaFields: [
    {
      label: "Nominated Area Address",
      name: "descriptionOfGoods",
      multiline: true,
      rows: 3,
      gridColumn: "col-span-1 row-span-3 ",
      type: "textarea",
      isEdit: true,
    },
    {
      label: "Port Type",
      name: "portType",
      type:"dropdown",
      labelType:"PORT",
    },
      {
      label: "Nominated Area Code",
      name: "nominatedAreaCode",
      },
     {
      label: "Nominated Area Description",
      name: "nominatedAreaCode",
      },
     {
      label: "PORT",
      name: "port",
      type:"dropdown",
      labelType:"PORT",
    },
     {
      label: "Direct Delivery",
      name: "directDelivery",
      type:"checkbox",
    },
    
     {
      label: "EDI Port Code",
      name: "ediPortCode",
      type:"number",
    },
    {
        label:"EDI Common Terminal Code",
        name:"ediCommonTerminalCode",
        type:"number",
    },
    {
        label:"Bond No",
        name:"bondNo",
        type:"number",
        
    }
  ],
};

export default fieldData;
