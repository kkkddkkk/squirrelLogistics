import React, { useCallback, useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import DriverHeader_Temp from '../../components/deliveryRequest/DriverHeader_Temp';
import DeliveryTrackingComponent from '../../components/deliveryTracking/DeliveryTrackingComponent';
import EmptyDeliveryTrackingComponent from '../../components/deliveryTracking/EmptyDeliveryTrackingComponent';
import { useParams } from 'react-router-dom';
import { fetchTodayDelivery } from '../../api/deliveryRequest/deliveryAssignmentAPI';
import LoadingComponent from '../../components/common/LoadingComponent';

export default function DeliveryTrackingPage() {
  const { driverId } = useParams();
  const [trackData, setTrackData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const refetch = useCallback((dataOverride) => {
    if (dataOverride) {  
      //최신 데이터 세팅.
      setTrackData({ ...dataOverride });
      return;
    }
    if (!driverId) return;
    setLoading(true);
    setErr(null);
    fetchTodayDelivery(driverId)
      .then((data) => {
        setTrackData(data ? { ...data } : null);
      })
      .catch((e) => {
        if (e?.name === 'CanceledError' || e?.name === 'AbortError') return;
        setErr(e?.response?.data || e?.message || '에러가 발생했습니다.');
      })
      .finally(() => setLoading(false));
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;
    let mounted = true;
    const controller = new AbortController();

    setLoading(true);
    setErr(null);
    fetchTodayDelivery(driverId, { signal: controller.signal })
      .then((data) => {
        if (!mounted) return;
        setTrackData(data ? { ...data } : null);
      })
      .catch((e) => {
        if (!mounted) return;
        if (e?.name === 'CanceledError' || e?.name === 'AbortError') return;
        setErr(e?.response?.data || e?.message || '에러가 발생했습니다.');
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [driverId]);

  const compKey = trackData
    ? `${trackData.assignedId}-${(trackData.lastStatusLog && trackData.lastStatusLog.status) || 'NONE'}-${(trackData.navigate && trackData.navigate[0] && trackData.navigate[0].waypointId) || 'start'}`
    : 'empty';

  return (
    <Box>
      <DriverHeader_Temp />

      {err && (
        <Box px={2} mb={1}>
          <Alert severity="error">{String(err)}</Alert>
        </Box>
      )}

      {trackData ? (
        <DeliveryTrackingComponent
          key={compKey}       // 상태 전이 시 리마운트 보장
          data={trackData}    // 반드시 data 전달
          onRefresh={refetch} // 자식에서 상태 변경 후 재요청
        />
      ) : (
        <EmptyDeliveryTrackingComponent />
      )}

      <LoadingComponent open={loading} text="오늘의 배송 불러오는 중..." />
    </Box>
  );
}