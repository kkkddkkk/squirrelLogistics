// src/router/estimate/estimateRouter.js

import { lazy, Suspense } from "react";

const Loading = <div>Loading 중...</div>;
const EstimatePage = lazy(() => import("../../pages/estimate/EstimatePage"));
const PaymentPage = lazy(() => import("../../pages/Payment/Payment"));
const ReportPage = lazy(() => import("../../pages/Report/Report"));

const estimateRouter = () => {
  return [
    {
      path: "/estimate",
      element: <Suspense fallback={Loading}><EstimatePage /></Suspense>
    },
    {
      path: "/company/payment",
      element: <Suspense fallback={Loading}><PaymentPage /></Suspense>
    },
    {
      path: "/company/report",
      element: <Suspense fallback={Loading}><ReportPage /></Suspense>
    }
  ];
};

export default estimateRouter;
