import { lazy, Suspense } from "react";

const driverRouter = () => {
  const Loading = "<div>로딩중</div>";

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

  return [
    {
      path: "list",
      element: (
        <Suspense fallback={Loading}>
          <RequestList />
        </Suspense>
      ),
    },
    {
      path: "detail/:requestId",
      element: (
        <Suspense fallback={Loading}>
          <RequestDetail />
        </Suspense>
      ),
    },
    {
      path: "ongoing",
      element: (
        <Suspense fallback={Loading}>
          <OnGoing />
        </Suspense>
      ),
    },
    {
      path: "review",
      element: (
        <Suspense fallback={Loading}>
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
        <Suspense fallback={Loading}>
          <Calender />
        </Suspense>
      ),
    },
    {
      path: "schedule/:scheduleId",
      element: (
        <Suspense fallback={Loading}>
          <Schedule />
        </Suspense>
      ),
    },
    {
      path: "profile",
      element: (
        <Suspense fallback={Loading}>
          <Profile />
        </Suspense>
      ),
    },
    {
      path: "editprofile",
      element: (
        <Suspense fallback={Loading}>
          <EditProfile />
        </Suspense>
      ),
    },
    {
      path: "verification",
      element: (
        <Suspense fallback={Loading}>
          <VerificationPage />
        </Suspense>
      ),
    },
    {
      path: "managevehicles",
      element: (
        <Suspense fallback={Loading}>
          <ManageVehicles />
        </Suspense>
      ),
    },
    {
      path: "deliveredlist",
      element: (
        <Suspense fallback={Loading}>
          <DeliveredList />
        </Suspense>
      ),
    },
    {
      path: "deliveredetail/:assignedId",
      element: (
        <Suspense fallback={Loading}>
          <DeliveredDetail />
        </Suspense>
      ),
    },
    {
      path: ":driverId/reportlist",
      element: (
        <Suspense fallback={Loading}>
          <ReportList />
        </Suspense>
      ),
    },
  ];
};
export default driverRouter;
