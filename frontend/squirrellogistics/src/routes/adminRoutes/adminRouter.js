// adminRoutes/adminRouter.js
import { lazy, Suspense } from "react";
const Loading = <div>로딩 중...</div>;

const UserList = lazy(() => import("../../pages/admin/UserList"));
const VehiclesPage = lazy(() => import("../../pages/admin/VehiclesPage"));
const TermsPage = lazy(() => import("../../pages/admin/TermsPage"));
const Banner = lazy(() => import("../../pages/admin/BannerPage"));
const AddBanner = lazy(() => import("../../pages/admin/AddBannerPage"));
const NoticeList = lazy(() => import("../../pages/Notice/NoticeListPage"));
const NoticeRead = lazy(() => import("../../pages/Notice/NoticeReadPage"));
const NoticeWirte = lazy(() => import("../../pages/Notice/NoticeWritePage"));
const SettlementBoard = lazy(() => import("../../pages/Settlement/SettlementDashboardPage"));
const UnsettledList = lazy(() => import("../../pages/Settlement/UnsettledListPage"));

export default function adminRouter() {
  return [
    {
      path: "users",
      element: (
        <Suspense fallback={Loading}>
          <UserList />
        </Suspense>
      ),
    },
    {
      path: "vehicles",
      element: (
        <Suspense fallback={Loading}>
          <VehiclesPage />
        </Suspense>
      ),
    },
    {
      path: "terms",
      element: (
        <Suspense fallback={Loading}>
          <TermsPage />
        </Suspense>
      ),
    },
      {
      path: "banner",
      element: <Suspense fallback={Loading}><Banner /></Suspense>,
    },
    {
      path: "banner/add",
      element: <Suspense fallback={Loading}><AddBanner /></Suspense>,
    },
    {
      path: "notice/list",
      element: <Suspense fallback={Loading}><NoticeList /></Suspense>,
    },
    {
      path: "notice/read/:id",
      element: <Suspense fallback={Loading}><NoticeRead /></Suspense>,
    },
    {
      path: "notice/edit/:id",
      element: <Suspense fallback={Loading}><NoticeWirte /></Suspense>,
    }, 
    {
      path: "notice/new",
      element: <Suspense fallback={Loading}><NoticeWirte /></Suspense>,
    },
    {
      path: "settlement/view",
      element: <Suspense fallback={Loading}><SettlementBoard /></Suspense>,
    },
    {
      path: "settlement/list",
      element: <Suspense fallback={Loading}><UnsettledList /></Suspense>,
    },
  ];
}
