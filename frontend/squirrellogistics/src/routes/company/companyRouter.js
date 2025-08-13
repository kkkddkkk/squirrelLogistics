// src/router/company/companyRouter.js
import { lazy, Suspense } from "react";

const Loading = <div>로딩 중...</div>;
const MyPage = lazy(() => import("../../pages/company/MyPage"));
//const MyReviews = lazy(() => import("../../pages/company/MyReviews"));
const CompanyVerifyPage = lazy(() => import("../../pages/company/CompanyVerifyPage"));
const CompanyEditPage = lazy(() => import("../../pages/company/CompanyEditPage"));
const SocialReauthComplete = lazy(() => import("../../pages/company/SocialReauthComplete"));

const companyRouter = () => {
  return [
    {
      path: "/company",
      element: <Suspense fallback={Loading}><MyPage /></Suspense>,
    },
    {
      path: "/company/verify",        // ✅ ① 본인인증
      element: <Suspense fallback={Loading}><CompanyVerifyPage /></Suspense>,
    },
    {
      path: "/company/edit",          // ✅ ② 정보수정 (인증 후 진입)
      element: <Suspense fallback={Loading}><CompanyEditPage /></Suspense>,
    },
    // {
    //   path: "/company/my-reviews",
    //   element: <Suspense fallback={Loading}><MyReviews /></Suspense>,
    // },
    { 
      path: "/auth/social-complete",
      element: <Suspense fallback={Loading}><SocialReauthComplete /></Suspense> 
    },
  ];
};

export default companyRouter;
