// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import estimateReducer from './slices/estimate/estimateSlice';

const store = configureStore({
  reducer: {
    estimate: estimateReducer,
  },
});

export default store;
