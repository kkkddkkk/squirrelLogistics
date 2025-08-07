// src/store.js

import { configureStore } from '@reduxjs/toolkit';
import estimateReducer from './slice/estimate/estimateSlice';
import driverSearchReducer from './slice/driversearch/driverSearchSlice'; // ✅ 추가

const store = configureStore({
  reducer: {
    estimate: estimateReducer,
    driverSearch: driverSearchReducer, // ✅ 여기 반드시 등록
  },
});

export default store;
