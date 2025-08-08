// src/hooks/driversearch/useDriverSearch.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDriverList, calculateDistance } from "../../api/driversearch/driverSearchApi";
import { setDrivers } from "../../slices/driversearch/driverSearchSlice";

const useDriverSearch = () => {
  const dispatch = useDispatch();
  const {
    region,
    keyword,
    isImmediate,
    maxWeight,
    vehicleType,
    sortOption,
    myLocation,
  } = useSelector((state) => state.driverSearch);

  useEffect(() => {
    const fetchDrivers = async () => {
      const filters = {
        region,
        keyword,
        isImmediate,
        maxWeight,
        vehicleType,
      };
      let drivers = await fetchDriverList(filters);

      // 정렬
      if (sortOption === "distance" && myLocation) {
        drivers = drivers
          .map((d) => ({
            ...d,
            distance: calculateDistance(myLocation.lat, myLocation.lng, d.lat, d.lng),
          }))
          .sort((a, b) => a.distance - b.distance);
      } else if (sortOption === "rating") {
        drivers = drivers.sort((a, b) => b.rating - a.rating);
      }

      dispatch(setDrivers(drivers));
    };

    fetchDrivers();
  }, [
    region,
    keyword,
    isImmediate,
    maxWeight,
    vehicleType,
    sortOption,
    myLocation,
    dispatch,
  ]);
};

export default useDriverSearch;

