import React, { useCallback, useEffect, useState } from "react";
import { Box, Alert } from "@mui/material";
import Header from "../Layout/Header"
import Footer from "../Layout/Footer"
import DeliveryTrackingComponent from "../../components/deliveryTracking/DeliveryTrackingComponent";
import EmptyDeliveryTrackingComponent from "../../components/deliveryTracking/EmptyDeliveryTrackingComponent";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTodayDelivery } from "../../api/deliveryRequest/deliveryAssignmentAPI";
import LoadingComponent from "../../components/common/LoadingComponent";
import { theme } from "../../components/common/CommonTheme";
import OneButtonPopupComponent from "../../components/deliveryRequest/OneButtonPopupComponent";

export default function DeliveryTrackingPage() {
  const [trackData, setTrackData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [errpopupOpen, setErrpopupOpen] = useState(false);
  const navigate = useNavigate();
  const refetch = useCallback((dataOverride) => {
    if (dataOverride) {
      //최신 데이터 세팅.
      setTrackData({ ...dataOverride });
      return;
    }
    setLoading(true);
    setErr(null);
    fetchTodayDelivery()
      .then((data) => {
        setTrackData(data ? { ...data } : null);
      })
      .catch((e) => {
        const errBody = e.response?.data;
        setErr(errBody?.message ?? e.message);
        setErrpopupOpen(true);
      })
      .finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    setLoading(true);
    setErr(null);
    fetchTodayDelivery({ signal: controller.signal })
      .then((data) => {
        if (!mounted) return;
        setTrackData(data ? { ...data } : null);
      })
      .catch((e) => {
        if (!mounted) return;
        const errBody = e.response?.data;
        setErr(errBody?.message ?? e.message);
        setErrpopupOpen(true);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);


  const runActionWithPageLoading = useCallback(async (fn) => {
    setLoading(true);
    try {
      await fn();
      await refetch();
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const compKey = trackData
    ? `${trackData.assignedId}-${(trackData.lastStatusLog && trackData.lastStatusLog.status) || 'NONE'}-${(trackData.navigate && trackData.navigate[0] && trackData.navigate[0].waypointId) || 'start'}`
    : 'empty';

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Header />

      {err && (
        <OneButtonPopupComponent
          open={errpopupOpen}
          onClick={() => {
            setErrpopupOpen(false);
            navigate("/");
          }}
          title={"올바르지 않은 접근"}
          content={
            <>
              {String(err)}
              <br />
              [확인] 클릭 시, 메인 화면으로 이동합니다.
            </>
          }
        />
      )}

      {trackData ? (
        <DeliveryTrackingComponent
          key={compKey}   
          data={trackData}   
          onRefresh={refetch}
          onActionRun={runActionWithPageLoading} 
        />
      ) : (
        <EmptyDeliveryTrackingComponent />
      )}

      <LoadingComponent open={loading} text="오늘의 배송 불러오는 중..." />
      <Footer />
    </Box>
  );
}
