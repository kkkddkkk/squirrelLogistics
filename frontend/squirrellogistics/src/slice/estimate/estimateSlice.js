// 📄 estimateSlice.js
// Redux Toolkit 상태관리 - 거리, 무게, 금액 계산

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  distance: 0,
  minWeight: 0,
  maxWeight: 0,
  price: 0
};

const estimateSlice = createSlice({
  name: 'estimate',
  initialState,
  reducers: {
    setDistance: (state, action) => {
      state.distance = action.payload;
    },
    setMinWeight: (state, action) => {
      state.minWeight = action.payload;
    },
    setMaxWeight: (state, action) => {
      state.maxWeight = action.payload;
    },
    calculatePrice: (state) => {
      const min = state.minWeight || 0;
      const max = state.maxWeight || min;
      const pricePerKm = 1000; // 예시 단가
      state.price = state.distance * ((min + max) / 2) * pricePerKm;
    }
  }
});

export const { setDistance, setMinWeight, setMaxWeight, calculatePrice } = estimateSlice.actions;
export default estimateSlice.reducer;
