import React from "react";
import { Grid } from "@mui/material";
import NoticeCard from "./NoticeCard";

export default function NoticeList({ notices, isAdmin, isMobile, refresh }) {
  return (
    <Grid container spacing={2} direction={"column"}>
      {notices.map((notice) => (
        <Grid item key={notice.noticeId}>
          <NoticeCard 
          notice={notice} 
          isAdmin={isAdmin} 
          isMobile={isMobile}
          refresh={refresh} 
          />
        </Grid>
      ))}
    </Grid>
  );
}