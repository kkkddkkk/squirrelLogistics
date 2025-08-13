// src/hook/company/useDeliveryFilter.js

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilteredList, resetFilteredList } from "../../slice/company/companySlice";

const STATUS_OPTIONS = ["배송완료", "배송중", "배송시작", "주문접수"];

const useDeliveryFilter = () => {
  const dispatch = useDispatch();
  const { deliveryList } = useSelector((state) => state.company);

  // ✅ 상태 필터 추가
  const [status, setStatus] = useState(""); // "" = 전체
  const [driverName, setDriverName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleChange = (field, value) => {
    if (field === "status") return setStatus(value);
    if (field === "driverName") return setDriverName(value);
    if (field === "trackingNumber") return setTrackingNumber(value);

    if (field === "search") {
      const filtered = deliveryList.filter((item) => {
        const matchStatus = status ? item.status === status : true;
        const matchDriver = driverName ? item.driverName?.includes(driverName) : true;
        const matchTracking = trackingNumber
          ? item.trackingNumber?.includes(trackingNumber)
          : true;

        return matchStatus && matchDriver && matchTracking;
      });

      dispatch(setFilteredList(filtered));
    }
  };

  const handleReset = () => {
    setStatus("");
    setDriverName("");
    setTrackingNumber("");
    dispatch(resetFilteredList());
  };

  return {
    status,
    driverName,
    trackingNumber,
    handleChange,
    handleReset,
    STATUS_OPTIONS,
  };
};

export default useDeliveryFilter;
