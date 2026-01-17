"use client";
import { formStore, useBackLinksStore, useBlWorkFlowData } from "@/store";
import { Box, Card, CardContent, Typography } from "@mui/material";
import Link from "next/link";
const noDataBgColor = "#b1ababff";

const months = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const RequestCard = ({ item }) => {
  const { workFlowData } = useBlWorkFlowData();
  const { setMode } = formStore();
  const data = workFlowData?.[0]?.[item?.keyName] ?? [];
  const { setBlStatus } = useBackLinksStore();
  const dataExists = data && Array.isArray(data) && data.length > 0;
  const buildLink = (keyName, referenceId, link, invoiceId, paymentId) => {
    const linkMappings = {
      invoiceRequest: link,
      invoice: invoiceId ? `${link}?invoiceRequestId=${referenceId}` : "#",
      invoicePayment: paymentId ? `${link}?invoiceRequestId=${referenceId}` : "#",
      do: link,
      receipt: link,
    };

    return linkMappings[keyName] || "#";
  };

  const handleClick = ({ formId }) => {
    setMode({
      formId: formId,
      mode: "view",
    });
    setBlStatus({ blStatus: "/bl-status" });
  };

  const renderDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = months[(dateObj.getMonth() + 1).toString()];
    return `${day} ${month}`;
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        borderRadius: 2,
        boxShadow: 3,
        marginTop: 3,
        height: 250,
        width: 210,
        backgroundColor: !dataExists ? noDataBgColor : "",
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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <CardContent sx={{ flex: 1, p: 2 }}>
          <Box>
            {data && Array.isArray(data) && data.length > 0 ? (
              <>
                {data.map((info, _index) => (
                  <Box className="mt-4" key={_index}>
                    <Link
                      href={buildLink(
                        item?.keyName,
                        info?.referenceId,
                        item?.link,
                        info?.invoiceId,
                        info?.paymentId
                      )}
                      onClick={() =>
                        handleClick({
                          formId:
                            info?.invoiceId ||
                            info?.paymentId ||
                            info?.referenceId,
                        })
                      }
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "primary.main",
                          fontWeight: "bold",
                          cursor: "pointer",
                          wordBreak: "break-word",
                          fontSize: 10,
                          textAlign: "left",
                        }}
                      >
                        {info?.referenceNo}{" "}
                        {info?.referenceDate
                          ? `(${renderDate(info?.referenceDate)})`
                          : ""}
                      </Typography>
                    </Link>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        cursor: "pointer",
                        wordBreak: "break-word",
                        fontSize: 10,
                        textAlign: "left",
                      }}
                    >
                      {info?.status
                        ? info?.status
                        : info?.bankName
                        ? `${
                            String(info?.bankName).charAt(0).toUpperCase() +
                            String(info?.bankName).slice(
                              1,
                              info?.bankName?.length
                            )
                          }, Rs.${info?.amount}`
                        : ""}
                    </Typography>
                    <hr
                      style={{
                        borderTop: `1px solid ${noDataBgColor}`,
                        opacity: "0.75",
                        marginTop: "10px",
                      }}
                    />
                  </Box>
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
