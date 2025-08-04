const fieldData = {
  userFields: [
    {
      label: "User Name",
      name: "userName",
    },
    {
      label: "Password",
      name: "password",
    },
    {
      label: "Email Address",
      name: "emailAddress",
    },
    {
      label: "Moblie",
      name: "mobile",
      type: "number",
    },
    {
      label: "Email Verification",
      name: "emailVerification",
      type:"radio",
      radioData: [
        { label: "True", value: "T" },
        { label: "False", value: "F" },
      ],
    },
     {
      label: "SMS Verification",
      name: "smsVerification",
      type:"radio",
      radioData: [
        { label: "True", value: "T" },
        { label: "False", value: "F" },
      ],
    },
     {
      label: "Two Step Verification",
      name: "twoStepVerification",
      type:"radio",
      radioData: [
        { label: "True", value: "T" },
        { label: "False", value: "F" },
      ],
    },
    {
        label:"Language",
        name:"language",
        type:"dropdown",
        labelType:"USER",
    },
     {
      label: "Date Time Format",
      name: "dateTimeFormat",
    },
     {
      label: "Number Format",
      name: "numberFormat",
    },
      {
        label:"Company Name",
        name:"companyName",
        type:"dropdown",
        labelType:"USER",
    },
     {
        label:"Company Branch",
        name:"companyBranch",
        type:"dropdown",
        labelType:"USER",
    },
     {
        label:"Financial Year",
        name:"financialYear",
        type:"dropdown",
        labelType:"USER",
    },
     {
        label:"Menu",
        name:"menu",
        type:"dropdown",
        labelType:"USER",
    },
     {
        label:"Theme",
        name:"theme",
        type:"dropdown",
        labelType:"USER",
    },
  ],
};

export default fieldData;
