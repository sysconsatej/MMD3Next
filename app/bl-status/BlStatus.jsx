import { Box } from "@mui/material";
import HorizontalLinearStepper from "./Wizard";

export const BlStatus = () => {
  const processArr = [
    
    {
      id: 1,
      cardType: "Request",
      bgColor: "#f47b20",
      status: "off",
    },
    {
      id: 2,
      cardType: "Invoices",
      bgColor: "#d47add",
      status: "off",
    },
    {
      id: 3,
      cardType: "Payments",
      bgColor: "#33c6f4",
      status: "off",
    },
    {
      id: 4,
      cardType: "Do",
      bgColor: "#a56cc1",
      status: "off",
    },
    {
      id: 5,
      cardType: "Receipts",
      bgColor: "#f8cf3e",
      status: "off",
    },
  ];

  return (
    <>
      <Box className="mt-5 px-5">
        <HorizontalLinearStepper steps={processArr} />
      </Box>
    </>
  );
};

