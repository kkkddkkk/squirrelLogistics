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
const ReportPage = lazy(() => import("../../pages/admin/ReportPage"));
const DetailReportLayout = lazy(() => import("../../pages/admin/DetailReportLayout"));
const DetailReportStatus = lazy(() => import("../../components/admin/Report/DetailReportStatus"));
const DetailReportCate = lazy(() => import("../../components/admin/Report/DetailReportCate"));
const DetailReportRank = lazy(() => import("../../components/admin/Report/DetailReportRank"));
const DetailReportMonthly = lazy(() => import("../../components/admin/Report/DetailReportMonthly"));
const CheckReportPage = lazy(() => import("../../pages/admin/CheckReportPage"));

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
    {
      path: "banner",
      element: <Suspense fallback={Loading}><Banner /></Suspense>,
    },
    {
      path: "banner/add",
      element: <Suspense fallback={Loading}><AddBanner /></Suspense>,
    },
    {
      path: "report",
      element: <Suspense fallback={Loading}><ReportPage /></Suspense>,
    },
    {
      path: "report/:reportId",
      element: <Suspense fallback={Loading}><CheckReportPage /></Suspense>,
    },
    {
      path: "report/list",
      element: <Suspense fallback={Loading}><DetailReportLayout /></Suspense>,
      children: [
        {
          path: "status",
          element: <Suspense fallback={Loading}><DetailReportStatus /></Suspense>,
        },
        {
          path: "cate",
          element: <Suspense fallback={Loading}><DetailReportCate /></Suspense>,
        },
        {
          path: "rank",
          element: <Suspense fallback={Loading}><DetailReportRank /></Suspense>,
        },
        {
          path: "monthly",
          element: <Suspense fallback={Loading}><DetailReportMonthly /></Suspense>,
        },
      ]
    },
  ];
}
