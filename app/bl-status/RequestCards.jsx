"use client";
import { formStore, useBlWorkFlowData } from "@/store";
import { Box, Card, CardContent, Typography } from "@mui/material";
import Link from "next/link";

const RequestCard = ({ item }) => {
  const { workFlowData } = useBlWorkFlowData();
  const { setMode } = formStore();
  const data = workFlowData?.[0]?.[item?.keyName] ?? [];

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        borderRadius: 2,
        boxShadow: 3,
        marginTop: 3,
        height: 250,
        width: 300,
      }}
    >
      <Box
        sx={{
          backgroundColor: `${item?.bgColor}`,
          color: "white",
          writingMode: {
            xs: "horizontal-tb",
            sm: "vertical-lr",
            md: "vertical-lr",
            lg: "vertical-rl",
          },
          textOrientation: { sm: "mixed" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: 14,
          p: { xs: 0.5, sm: 1 },
          height: {
            xs: "auto",
            sm: "auto",
            md: "auto",
            lg: "auto",
            xl: "auto",
          },
          width: { xs: "100%", sm: "auto" },
          rotate: { md: "180deg" },
        }}
      >
        {item?.cardType}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1, p: 2 }}>
          <Box>
            {data && Array.isArray(data) && data.length > 0 ? (
              <>
                {data.map((info, _index) => (
                  <Link
                    href={item?.link ||  '#'}
                    key={_index}
                    onClick={() =>
                      setMode({ formId: info?.referenceId, mode: "view" })
                    }
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        fontWeight: "bold",
                        cursor: "pointer",
                        wordBreak: "break-word",
                        fontSize: 12,
                      }}
                    >
                      {info?.referenceNo}
                    </Typography>
                  </Link>
                ))}
              </>
            ) : (
              <></>
            )}
            {/* 
            <Typography variant="body2" sx={{ mt: 1, fontSize: 12 }}>
              Released
            </Typography> */}
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default RequestCard;
