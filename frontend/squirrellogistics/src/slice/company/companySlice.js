// src/slices/company/companySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUserInfo,
  getDeliveryList,
  verifyCredentials as apiVerifyCredentials,
  // ⬇️ 임시비번 대신 단발성 토큰 링크 요청 API 사용
  requestPasswordReset as apiRequestPasswordReset,
  updateCompanyProfile as apiUpdateCompanyProfile,
} from "../../api/company/companyApi";

/* -----------------------------
 * Thunks
 * --------------------------- */
// 1) 마이페이지 유저 정보
export const fetchUserInfo = createAsyncThunk(
  "company/fetchUserInfo",
  async () => await getUserInfo()
);

// 2) 배송 리스트
export const fetchDeliveryList = createAsyncThunk(
  "company/fetchDeliveryList",
  async () => await getDeliveryList()
);

// 3) 아이디/비번 본인인증
export const verifyByCredential = createAsyncThunk(
  "company/verifyByCredential",
  async ({ loginId, password }) => {
    const ok = await apiVerifyCredentials({ loginId, password });
    return ok; // true | false
  }
);

// 4) 비밀번호 재설정 링크 요청(이전 sendTempPassword 대체)
export const sendTempPassword = createAsyncThunk(
  "company/sendTempPassword", // action type은 유지(기존 코드 호환)
  async (email) => {
    const ok = await apiRequestPasswordReset(email); // 토큰 링크 요청
    return ok; // true | false
  }
);

// 5) 프로필(비번/계좌/주소) 업데이트
export const updateProfile = createAsyncThunk(
  "company/updateProfile",
  async (payload) => {
    // payload: { newPassword?, bankName, accountNumber, address, addressDetail }
    const updatedUser = await apiUpdateCompanyProfile(payload);
    return updatedUser; // 서버에서 최신 userInfo 반환
  }
);

/* -----------------------------
 * State
 * --------------------------- */
const initialState = {
  userInfo: null,
  deliveryList: [],
  filteredList: [],

  loading: false,
  error: null,

  // 본인인증/메일/업데이트 상태
  verifyOk: false,
  sendingTemp: false, // 버튼 로딩 제어 등에 사용
  updating: false,
};

/* -----------------------------
 * Slice
 * --------------------------- */
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
      state.userInfo = null;
      state.deliveryList = [];
      state.filteredList = [];
      state.loading = false;
      state.error = null;
      state.verifyOk = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ 유저 정보
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

      // ✅ 배송 리스트
      .addCase(fetchDeliveryList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeliveryList.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryList = action.payload || [];
      })
      .addCase(fetchDeliveryList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // ✅ 본인인증
      .addCase(verifyByCredential.fulfilled, (state, action) => {
        state.verifyOk = action.payload === true;
      })

      // ✅ 비번 재설정 링크 요청(이전 sendTempPassword 자리)
      .addCase(sendTempPassword.pending, (state) => {
        state.sendingTemp = true;
      })
      .addCase(sendTempPassword.fulfilled, (state) => {
        state.sendingTemp = false;
      })
      .addCase(sendTempPassword.rejected, (state) => {
        state.sendingTemp = false;
      })

      // ✅ 프로필 업데이트
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) state.userInfo = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilteredList, resetFilteredList, logout } = companySlice.actions;
export default companySlice.reducer;

/* -----------------------------
 * Selectors
 * --------------------------- */
export const selectCompanyUser = (s) => s.company.userInfo;
export const selectDeliveries = (s) => s.company.deliveryList;
export const selectFiltered = (s) => s.company.filteredList;
export const selectVerifyOk = (s) => s.company.verifyOk;
export const selectCompanyLoading = (s) => s.company.loading || s.company.updating;
