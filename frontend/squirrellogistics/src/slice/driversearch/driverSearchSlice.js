// src/slices/driversearch/driverSearchSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  region: "",         // 선택된 지역
  keyword: "",        // 검색어
  isImmediate: false, // 즉시 배차 여부
  maxWeight: "",      // 최대 적재량
  vehicleType: "",    // 차량 종류
  sortOption: "",     // 정렬 기준 (거리순 or 별점순)
  myLocation: null,    // 현재 위치 좌표 { lat, lng }
  drivers: []          // 검색된 기사 리스트
};

const driverSearchSlice = createSlice({
  name: "driverSearch",
  initialState,
  reducers: {
    setRegion: (state, action) => {
      state.region = action.payload;
    },
    setKeyword: (state, action) => {
      state.keyword = action.payload;
    },
    setIsImmediate: (state, action) => {
      state.isImmediate = action.payload;
    },
    setMaxWeight: (state, action) => {
      state.maxWeight = action.payload;
    },
    setVehicleType: (state, action) => {
      state.vehicleType = action.payload;
    },
    setSortOption: (state, action) => {
      state.sortOption = action.payload;
    },
    setMyLocation: (state, action) => {
      state.myLocation = action.payload; // { lat, lng }
    },
    setDrivers: (state, action) => {
      state.drivers = action.payload;
    }
  }
});

export const {
  setRegion,
  setKeyword,
  setIsImmediate,
  setMaxWeight,
  setVehicleType,
  setSortOption,
  setMyLocation,
  setDrivers
} = driverSearchSlice.actions;

export default driverSearchSlice.reducer;
