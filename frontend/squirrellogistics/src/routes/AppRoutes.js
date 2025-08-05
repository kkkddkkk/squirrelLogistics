// src/routes/AppRoutes.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout"; // 사이드바 + 탑바 포함 레이아웃
import Dashboard from "../pages/Dashboard/Dashboard"; // 대시보드 메인
import SupportLayout from "../pages/Support/SupportLayout";

import NoticeList from "../pages/Support/Notice/NoticeList";
import NoticeForm from "../pages/Support/Notice/NoticeForm";
import FAQList from "../pages/Support/FAQ/FAQList";
import FAQForm from "../pages/Support/FAQ/FAQForm";
import InquiryList from "../pages/Support/Inquiry/InquiryList";
import InquiryDetail from "../pages/Support/Inquiry/InquiryDetail";
import PolicyPage from "../pages/Support/Policy/PolicyPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 기본 루트 리디렉션 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 전체 관리자 공통 레이아웃 */}
      <Route path="/" element={<AdminLayout />}>
        {/* 대시보드 */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* 고객지원 모듈 */}
        <Route path="support" element={<SupportLayout />}>
          <Route index element={<Navigate to="notices" replace />} />

          {/* 공지사항 */}
          <Route path="notices" element={<NoticeList />} />
          <Route path="notices/new" element={<NoticeForm />} />
          <Route path="notices/:id" element={<NoticeForm />} />

          {/* FAQ */}
          <Route path="faq" element={<FAQList />} />
          <Route path="faq/new" element={<FAQForm />} />
          <Route path="faq/:id" element={<FAQForm />} />

          {/* 1:1 문의 */}
          <Route path="inquiry" element={<InquiryList />} />
          <Route path="inquiry/:id" element={<InquiryDetail />} />

          {/* 정책 */}
          <Route path="policy" element={<PolicyPage />} />
        </Route>

        {/* 추가적으로 Management 등도 여기에 연결 가능 */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
