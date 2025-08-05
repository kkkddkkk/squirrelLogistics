// src/router/estimate/estimateRouter.js

import { lazy, Suspense } from "react";

const Loading = <div>Loading 중...</div>;
const EstimatePage = lazy(() => import("../../pages/estimate/EstimatePage"));

const estimateRouter = () => {
  return [
    {
      path: "/estimate",
      element: <Suspense fallback={Loading}><EstimatePage /></Suspense>
    }
  ];
};

export default estimateRouter;
