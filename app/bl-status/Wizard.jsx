"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { StepConnector, stepConnectorClasses, styled } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import RequestCard from "./RequestCards";

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "green",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "green",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    backgroundColor: "#eaeaf0",
    zIndex: 1,
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[800],
    }),
  },
}));

const ColorlibStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  // zIndex: -1,
  width: 30,
  height: 30,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[700],
  }),
  variants: [
    {
      style: {
        backgroundColor: ownerState?.completed ? "green" : "gray",
      },
    },
    {
      style: {
        backgroundColor: ownerState?.completed ? "green" : "gray",
      },
    },
  ],
}));

function ColorlibStepIcon(props) {
  const { active, completed } = props;
  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }}>
      {completed ? <DoneIcon sx={{ color: "#FFF" }} /> : <></>}
    </ColorlibStepIconRoot>
  );
}

export default function HorizontalLinearStepper({ steps }) {
  // const [activeStep, setActiveStep] = React.useState(0);

  // const handleNext = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep + 1);
  // };

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // };

  // const handleReset = () => {
  //   setActiveStep(0);
  // };

  return (
    <Box sx={{ width: "100%" }}>
      {/* {activeStep === steps.length ? (
        <React.Fragment>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleNext}>
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
      {/* connector props is the line bwteen 2 steps */}
      {/* <Stepper
        activeStep={activeStep}
        connector={<ColorlibConnector />}
        alternativeLabel
      >
        {steps.map((label, index) => {
          const isActive = activeStep === index;
          const isCompleted = activeStep > index;
          return (
            <Step key={label?.id}>
              <StepLabel
                slots={{
                  stepIcon: ColorlibStepIcon,
                }}
                slotProps={{
                  stepIcon: {
                    active: isActive,
                    completed: isCompleted,
                  },
                }}
              >
                {label?.cardType}
                <RequestCard item={label} />
              </StepLabel>
            </Step>
          );
        })}
      </Stepper> */}
      <Box sx={{ display: "flex", flexDirection: "row", pt: 2 , gap : 10}}>
        {steps?.map((info) => (
          <RequestCard key={info.id} item={info} />
        ))}
      </Box>
    </Box>
  );
}
