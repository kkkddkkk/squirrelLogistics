// src/store.js

import { configureStore } from '@reduxjs/toolkit';
import estimateReducer from './slice/estimate/estimateSlice';
import driverSearchReducer from './slice/driversearch/driverSearchSlice';
import companyReducer from './slice/company/companySlice'; // ✅ 추가

const store = configureStore({
  reducer: {
    estimate: estimateReducer,
    driverSearch: driverSearchReducer,
    company: companyReducer, // ✅ 등록 완료
  },
});

export default store;
