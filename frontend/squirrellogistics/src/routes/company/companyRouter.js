// src/router/company/companyRouter.js
import { lazy, Suspense } from "react";

const Loading = <div>로딩 중...</div>;
const MyPage = lazy(() => import("../../pages/company/MyPage"));
const CompanyVerifyPage = lazy(() => import("../../pages/company/CompanyVerifyPage"));
const CompanyEditPage = lazy(() => import("../../pages/company/CompanyEditPage"));
const SocialReauthComplete = lazy(() => import("../../pages/company/SocialReauthComplete"));
const Payment = lazy(() => import("../../pages/Payment/Payment"));
const Success = lazy(() => import("../../pages/Payment/PaymentSuccess"));
const History = lazy(() => import("../../pages/History/History"));
const Report = lazy(() => import("../../pages/Report/Report"));
const ReportList = lazy(() => import("../../pages/Report/ReportList"));
const ReviewList = lazy(() => import("../../pages/Review/ReviewList"));
const ActualCalc = lazy(() => import("../../pages/ActualCalc/ActualCalc"));
const DetailHistory = lazy(() => import("../../pages/History/DetailHistory"));

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
    { 
      path: "/company/auth/social-complete",
      element: <Suspense fallback={Loading}><SocialReauthComplete /></Suspense> 
    },    {
      path: "payment",//결제
      element: <Suspense fallback={Loading}><Payment /></Suspense>,
    }, {
      path: `paymentSuccess`,//결제 성공+실패
      element: <Suspense fallback={Loading}><Success></Success></Suspense>
    }, {
      path: `history`,//이용기록
      element: <Suspense fallback={Loading}><History></History></Suspense>
    }, {
      path: `actualCalc`,//실계산
      element: <Suspense fallback={Loading}><ActualCalc></ActualCalc></Suspense>
    }, {
      path: `report`,//신고
      element: <Suspense fallback={Loading}><Report></Report></Suspense>
    }, {
      path: `reportList`,//신고리스트
      element: <Suspense fallback={Loading}><ReportList></ReportList></Suspense>
    }, {
      path: `reviewList`,//리뷰리스트
      element: <Suspense fallback={Loading}><ReviewList></ReviewList></Suspense>
    },, {
      path: `detailHistory`,//리뷰리스트
      element: <Suspense fallback={Loading}><DetailHistory></DetailHistory></Suspense>
    }
  ];
};

export default companyRouter;
