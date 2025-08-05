// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import estimateReducer from './slice/estimate/estimateSlice';

const store = configureStore({
  reducer: {
    estimate: estimateReducer,
  },
});

export default store;
