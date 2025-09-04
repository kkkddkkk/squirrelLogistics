import { lazy, Suspense } from "react";
import LoadingComponent from "../../components/common/LoadingComponent";

const driverRouter = () => {
  const LoadingFallback = <LoadingComponent open text="로딩중..." />;

  //요청 목록 페이지.
  const RequestList = lazy(() =>
    import("../../pages/DeliveryRequest/ListPage")
  );
  //요청 상세 페이지.
  const RequestDetail = lazy(() =>
    import("../../pages/DeliveryRequest/RequestDetailPage")
  );
  //현재 진행중 요청 페이지.
  const OnGoing = lazy(() =>
    import("../../pages/DeliveryTracking/DeliveryTrackingPage")
  );
  //기사 월별 일정 페이지.
  const Calender = lazy(() =>
    import("../../pages/DriverSchedule/DriverMonthlyPage")
  );
  //개별 일정 상세 페이지.
  const Schedule = lazy(() =>
    import("../../pages/DriverSchedule/DriverIndividualSchedulePage")
  );
  //기사 리뷰 목록 페이지.
  const Review = lazy(() =>
    import("../../pages/DriverReview/DriverReviewListPage")
  );

  //const Report = lazy(() => import("../pages/member/KakaoRedirectPage"));
  //const History = lazy(() => import("../../pages/DeliveryHistory/HistoryListPage"));

  const Profile = lazy(() => import("../../pages/Driver/DriverProfile"));
  const EditProfile = lazy(() => import("../../pages/Driver/EditProfile"));
  const VerificationPage = lazy(() =>
    import("../../pages/Driver/VerificationPage")
  );
  const ManageVehicles = lazy(() =>
    import("../../pages/Driver/ManageVehicles")
  );
  const DeliveredList = lazy(() => import("../../pages/Driver/DeliveredList"));
  const DeliveredDetail = lazy(() =>
    import("../../pages/Driver/DeliveredDetail")
  );
  const ReportList = lazy(() => import("../../pages/Report/ReportList"));
  const DriverReportList = lazy(() =>
    import("../../pages/Driver/DriverReportList")
  );

  return [
    {
      path: "list",
      element: (
        <Suspense fallback={LoadingFallback}>
          <RequestList />
        </Suspense>
      ),
    },
    {
      path: "detail/:requestId",
      element: (
        <Suspense fallback={LoadingFallback}>
          <RequestDetail />
        </Suspense>
      ),
    },
    {
      path: "ongoing",
      element: (
        <Suspense fallback={LoadingFallback}>
          <OnGoing />
        </Suspense>
      ),
    },
    {
      path: "review",
      element: (
        <Suspense fallback={LoadingFallback}>
          <Review />
        </Suspense>
      ),
    },
    // {
    //     path: "report/:driverId",
    //     element: (
    //         <Suspense fallback={Loading}>
    //             <Report />
    //         </Suspense>
    //     )
    // },
    {
      path: "calendar/:year/:month",
      element: (
        <Suspense fallback={LoadingFallback}>
          <Calender />
        </Suspense>
      ),
    },
    {
      path: "schedule/:scheduleId",
      element: (
        <Suspense fallback={LoadingFallback}>
          <Schedule />
        </Suspense>
      ),
    },
    {
      path: "profile",
      element: (
        <Suspense fallback={LoadingFallback}>
          <Profile />
        </Suspense>
      ),
    },
    {
      path: "editprofile",
      element: (
        <Suspense fallback={LoadingFallback}>
          <EditProfile />
        </Suspense>
      ),
    },
    {
      path: "verification",
      element: (
        <Suspense fallback={LoadingFallback}>
          <VerificationPage />
        </Suspense>
      ),
    },
    {
      path: "managevehicles",
      element: (
        <Suspense fallback={LoadingFallback}>
          <ManageVehicles />
        </Suspense>
      ),
    },
    {
      path: "deliveredlist",
      element: (
        <Suspense fallback={LoadingFallback}>
          <DeliveredList />
        </Suspense>
      ),
    },
    {
      path: "deliveredetail/:assignedId",
      element: (
        <Suspense fallback={LoadingFallback}>
          <DeliveredDetail />
        </Suspense>
      ),
    },
    {
      path: "reportlist",
      element: (
        <Suspense fallback={LoadingFallback}>
          <ReportList />
        </Suspense>
      ),
    },
    {
      path: "reports/:userId",
      element: (
        <Suspense fallback={LoadingFallback}>
          <DriverReportList />
        </Suspense>
      ),
    },
  ];
};
export default driverRouter;
