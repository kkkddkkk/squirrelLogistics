// src/router/company/companyRouter.js
import { lazy, Suspense } from "react";

const Loading = <div>로딩 중...</div>;
const MyPage = lazy(() => import("../../pages/company/MyPage"));
// const MyReviews = lazy(() => import("../../pages/company/MyReviews")); // 리뷰 페이지 추가
const Payment = lazy(() => import("../../pages/Payment/Payment"));
const Success = lazy(() => import("../../pages/Payment/PaymentSuccess"));
const History = lazy(() => import("../../pages/History/History"));
const Report = lazy(() => import("../../pages/Report/Report"));
const ReportList = lazy(() => import("../../pages/Report/ReportList"));
const ReviewList = lazy(() => import("../../pages/Review/ReviewList"));
const ActualCalc = lazy(() => import("../../pages/ActualCalc/ActualCalc"));

const companyRouter = () => {
  return [
    {
      path: "",
      element: <Suspense fallback={Loading}><MyPage /></Suspense>,
    },
    // {
    //   path: "/company/my-reviews", // 내가 쓴 리뷰 페이지
    //   element: <Suspense fallback={Loading}><MyReviews /></Suspense>,
    // },
    {
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
    }
  ];
};

export default companyRouter;
