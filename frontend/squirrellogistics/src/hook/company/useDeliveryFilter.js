// src/hooks/company/useDeliveryFilter.js

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilteredList, resetFilteredList } from "../../slice/company/companySlice";

const useDeliveryFilter = () => {
  const dispatch = useDispatch();
  const { deliveryList } = useSelector((state) => state.company);

  const [deliveryDate, setDeliveryDate] = useState(null);
  const [driverName, setDriverName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleChange = (field, value) => {
    if (field === "deliveryDate") return setDeliveryDate(value);
    if (field === "driverName") return setDriverName(value);
    if (field === "trackingNumber") return setTrackingNumber(value);
    if (field === "search") {
      const filtered = deliveryList.filter((item) => {
        const matchDriver = driverName ? item.driverName?.includes(driverName) : true;
        const matchTracking = trackingNumber ? item.trackingNumber?.includes(trackingNumber) : true;
        const matchDate = deliveryDate
          ? new Date(item.arrivalDate).toDateString() === new Date(deliveryDate).toDateString()
          : true;
        return matchDriver && matchTracking && matchDate;
      });
      dispatch(setFilteredList(filtered));
    }
  };

  const handleReset = () => {
    setDeliveryDate(null);
    setDriverName("");
    setTrackingNumber("");
    dispatch(resetFilteredList());
  };

  return {
    deliveryDate,
    driverName,
    trackingNumber,
    handleChange,
    handleReset,
  };
};

export default useDeliveryFilter;
