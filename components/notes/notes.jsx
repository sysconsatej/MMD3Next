"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { getDataWithCondition } from "@/apis";
import { getUserByCookies } from "@/utils";

export default function ModuleNotes({ shippingLineId, moduleName }) {
  const [notes, setNotes] = useState([]);
  const userData = getUserByCookies();

  useEffect(() => {
    async function loadNotes() {
      // ⭐ Clear notes when shipping line removed
      if (!shippingLineId) {
        setNotes([]);
        return;
      }

      const q = {
        columns: "m.notes",
        tableName: "tblModuleNotes m",
        joins: `
        LEFT JOIN tblMasterData master1 
        ON master1.id = m.moduleId
      `,
        whereCondition: `
        m.shippingLineId = ${shippingLineId}
        AND m.locationId = ${userData.location}
        AND m.status = 1
        AND master1.name = '${moduleName}'
      `,
      };

      const { success, data } = await getDataWithCondition(q);

      if (success && data?.length) {
        setNotes(data.map((x) => x.notes));
      } else {
        setNotes([]);
      }
    }

    loadNotes();
  }, [shippingLineId, moduleName]);

  if (!notes.length) return null;

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: "1px solid #ddd",
        background: "#fafafa",
        borderRadius: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: "#c62828", mb: 1 }}
      >
        Note:-
      </Typography>

      {notes.map((note, i) => (
        <Typography
          key={i}
          variant="caption"
          sx={{
            display: "block",
            mb: 1,
            color: "#444",
            whiteSpace: "pre-line",
          }}
        >
          {note}
        </Typography>
      ))}
    </Box>
  );
}
