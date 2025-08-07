// src/router/driversearch/driverSearchRouter.js
import { lazy, Suspense } from "react";

const DriverSearchPage = lazy(() => import("../../pages/driversearch/DriverSearchPage"));
const Loading = <div>로딩 중...</div>;

const driverSearchRouter = () => [
  {
    path: "/search-drivers",
    element: <Suspense fallback={Loading}><DriverSearchPage /></Suspense>,
  },
];

export default driverSearchRouter;
