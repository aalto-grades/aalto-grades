// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import { Card, CardContent, Typography } from "@mui/material";
import type { JSX, ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
}

const DashboardCard = ({
  title,
  children,
}: DashboardCardProps): JSX.Element => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      bgcolor: "background.paper",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      transition: "box-shadow 0.2s",
      "&:hover": {
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      },
    }}
  >
    <CardContent
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 3 }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        fontWeight={700}
        sx={{ textTransform: "uppercase", letterSpacing: 1.2, mb: 2.5 }}
      >
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

export default DashboardCard;
