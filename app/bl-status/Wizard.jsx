"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { stepConnectorClasses, styled, StepConnector } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import RequestCard from "./RequestCards";
import { useBlWorkFlowData } from "@/store";

const ColorlibConnector = styled(StepConnector)(({ theme, ownerState }) => {
  return {
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: "15px !important",
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor: ownerState?.active
          ? "green !important"
          : "grey !important",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor: ownerState?.completed
          ? "green !important"
          : "grey !important",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 2,
      backgroundColor: "grey !important",
      zIndex: 1,
      ...theme.applyStyles("dark", {
        backgroundColor: "grey !important",
      }),
    },
  };
});

const ColorlibStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  width: "30px !important",
  height: "30px !important",
  display: "flex !important",
  borderRadius: "50%  !important",
  justifyContent: "center !important",
  alignItems: "center !important",
  ...theme.applyStyles("dark", {
    backgroundColor: ownerState?.completed
      ? "#087444ff !important"
      : theme.palette.grey[700],
  }),
  variants: [
    {
      style: {
        backgroundColor: ownerState?.completed
          ? "green !important"
          : "gray !important",
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
  const { workFlowData } = useBlWorkFlowData();
  const data = workFlowData?.[0] ?? [];
  const checkLength = steps.filter(
    (info) => data && data[info?.keyName]?.length > 0
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        pt: 2,
        gap: 5,
      }}
    >
      <Stepper
        connector={<ColorlibConnector  />}
        alternativeLabel
      >
        {steps.map((info) => {
          const isActive =
            data && data[info?.keyName]?.length > 0 ? true : false;
          const isCompleted =
            data && data[info?.keyName]?.length > 0 ? true : false;
          return (
            <Step key={info?.id}>
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
                {info?.cardType}
                <RequestCard key={info.id} item={info} />
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
