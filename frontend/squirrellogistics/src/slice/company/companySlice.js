// src/slices/company/companySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserInfo, getDeliveryList } from "../../api/company/companyApi";

// 📌 비동기 thunk
export const fetchUserInfo = createAsyncThunk(
  "company/fetchUserInfo",
  async () => {
    const data = await getUserInfo();
    return data;
  }
);

export const fetchDeliveryList = createAsyncThunk(
  "company/fetchDeliveryList",
  async () => {
    const data = await getDeliveryList();
    return data;
  }
);

// 초기 상태
const initialState = {
  userInfo: null,
  deliveryList: [],
  filteredList: [],
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    setFilteredList: (state, action) => {
      state.filteredList = action.payload;
    },
    resetFilteredList: (state) => {
      state.filteredList = [];
    },
    logout: (state) => {
      // 회원 정보와 배송 리스트 초기화
      state.userInfo = null;
      state.deliveryList = [];
      state.filteredList = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchDeliveryList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeliveryList.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryList = action.payload;
      })
      .addCase(fetchDeliveryList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilteredList, resetFilteredList, logout } = companySlice.actions;
export default companySlice.reducer;
