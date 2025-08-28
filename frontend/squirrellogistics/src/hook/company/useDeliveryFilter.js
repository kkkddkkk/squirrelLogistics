// src/hook/company/useDeliveryFilter.js

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilteredList, resetFilteredList } from "../../slice/company/companySlice";

const STATUS_OPTIONS = ["배송완료", "배송중", "취소", "주문접수"];

const useDeliveryFilter = () => {
  const dispatch = useDispatch();
  const { deliveryList } = useSelector((state) => state.company);

  // ✅ 상태 필터
  const [status, setStatus] = useState(""); // "" = 전체
  const [name, setName] = useState(""); // driverName → name
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleChange = (field, value) => {
    if (field === "status") return setStatus(value);
    if (field === "name") return setName(value); // ← key도 name으로
    if (field === "trackingNumber") return setTrackingNumber(value);

    if (field === "search") {
      const filtered = deliveryList.filter((item) => {
        const matchStatus = status ? item.status === status : true;
        const matchDriver = name ? item.name?.includes(name) : true; // item.driverName → item.name
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
    setName(""); // driverName → name
    setTrackingNumber("");
    dispatch(resetFilteredList());
  };

  return {
    status,
    name, // driverName → name
    trackingNumber,
    handleChange,
    handleReset,
    STATUS_OPTIONS,
  };
};

export default useDeliveryFilter;
