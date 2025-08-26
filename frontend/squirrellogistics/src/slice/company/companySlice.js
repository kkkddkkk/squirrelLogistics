// src/slices/company/companySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUserInfo,
  getMyPageInfo,
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

// 2-1) 마이페이지 회원정보 (CompanyMyPageResponseDTO)
export const fetchCompanyMyPageInfo = createAsyncThunk(
  "company/fetchCompanyMyPageInfo",
  async () => await getMyPageInfo()
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
  myPageInfo: null, // 마이페이지 회원정보 추가
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
      state.myPageInfo = null; // 마이페이지 정보도 초기화
      state.loading = false;
      state.error = null;
      state.verifyOk = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setVerifyOk: (state, action) => {
      state.verifyOk = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1) 마이페이지 유저 정보
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // 2) 배송 리스트
      .addCase(fetchDeliveryList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryList.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryList = action.payload;
        state.filteredList = action.payload; // 초기에는 전체 리스트
      })
      .addCase(fetchDeliveryList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // 2-1) 마이페이지 회원정보
      .addCase(fetchCompanyMyPageInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyMyPageInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.myPageInfo = action.payload;
      })
      .addCase(fetchCompanyMyPageInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // 3) 아이디/비번 본인인증
      .addCase(verifyByCredential.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyByCredential.fulfilled, (state, action) => {
        state.loading = false;
        state.verifyOk = action.payload;
      })
      .addCase(verifyByCredential.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // 4) 비밀번호 재설정 링크 요청
      .addCase(sendTempPassword.pending, (state) => {
        state.sendingTemp = true;
        state.error = null;
      })
      .addCase(sendTempPassword.fulfilled, (state, action) => {
        state.sendingTemp = false;
        // 성공/실패 여부는 action.payload로 확인 가능
      })
      .addCase(sendTempPassword.rejected, (state, action) => {
        state.sendingTemp = false;
        state.error = action.error.message;
      })

      // 5) 프로필 업데이트
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.userInfo = action.payload; // 업데이트된 정보로 교체
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setFilteredList,
  resetFilteredList,
  logout,
  clearError,
  setVerifyOk,
} = companySlice.actions;

// 모든 Thunk 함수들이 이미 export const로 선언되어 있으므로 추가 export 불필요

export default companySlice.reducer;
