// src/router/company/companyRouter.js
import { lazy, Suspense } from "react";

const Loading = <div>로딩 중...</div>;
const MyPage = lazy(() => import("../../pages/company/MyPage"));
const MyReviews = lazy(() => import("../../pages/company/MyReviews")); // 리뷰 페이지 추가

const companyRouter = () => {
  return [
    {
      path: "/company",
      element: <Suspense fallback={Loading}><MyPage /></Suspense>,
    },
    {
      path: "/company/my-reviews", // 내가 쓴 리뷰 페이지
      element: <Suspense fallback={Loading}><MyReviews /></Suspense>,
    },
  ];
};

export default companyRouter;
