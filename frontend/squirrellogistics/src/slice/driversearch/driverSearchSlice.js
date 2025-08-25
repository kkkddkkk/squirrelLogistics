// src/slices/driversearch/driverSearchSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  keyword: "",           // String - 검색어
  region: "",            // String - 선호 지역
  drivable: false,       // Boolean - 즉시 배차 가능 여부 (Driver.drivable 필드와 일치)
  maxWeight: null,       // Number | null - 최대 적재량
  vehicleType: null,     // Number | null - 차량 종류 ID (Long 타입과 호환)
  sortOption: "",        // String - 정렬 기준 (distance, rating)
  latitude: null,        // Number | null - 현재 위치 위도
  longitude: null,       // Number | null - 현재 위치 경도
  page: 0,              // Number - 페이지 번호
  size: 10,             // Number - 페이지 크기
  drivers: []            // Array - 검색된 기사 리스트
};

const driverSearchSlice = createSlice({
  name: "driverSearch",
  initialState,
  reducers: {
    setKeyword: (state, action) => {
      state.keyword = action.payload;
    },
    setRegion: (state, action) => {
      state.region = action.payload;
    },
    setDrivable: (state, action) => {
      state.drivable = action.payload;
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
    setLatitude: (state, action) => {
      state.latitude = action.payload;
    },
    setLongitude: (state, action) => {
      state.longitude = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setSize: (state, action) => {
      state.size = action.payload;
    },
    setMyLocation: (state, action) => {
      // { lat, lng } 객체를 받아서 latitude, longitude로 분리
      if (action.payload) {
        state.latitude = action.payload.lat;
        state.longitude = action.payload.lng;
      } else {
        state.latitude = null;
        state.longitude = null;
      }
    },
    setDrivers: (state, action) => {
      state.drivers = action.payload;
    }
  }
});

export const {
  setKeyword,
  setRegion,
  setDrivable,
  setMaxWeight,
  setVehicleType,
  setSortOption,
  setLatitude,
  setLongitude,
  setPage,
  setSize,
  setMyLocation,
  setDrivers
} = driverSearchSlice.actions;

export default driverSearchSlice.reducer;
