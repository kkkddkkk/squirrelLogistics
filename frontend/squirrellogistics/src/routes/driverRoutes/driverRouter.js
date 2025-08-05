import { lazy, Suspense } from "react"

const driverRouter = () => {

    const Loading = "<div>로딩중</div>";


    //const RequestList = lazy(() => import("../../pages/DeliveryRequest/ListPage"));
    const RequestDetail = lazy(() => import("../../pages/DeliveryRequest/RequestDetailPage"));
    const OnGoing = lazy(() => import("../../pages/DeliveryTracking/DeliveryTrackingPage"));
    //const Review = lazy(() => import("../../pages/DeliveryReview/ReviewListPage"));
    //const Calender = lazy(() => import("../pages/member/KakaoRedirectPage"));
    //const Report = lazy(() => import("../pages/member/KakaoRedirectPage"));

    //const History = lazy(() => import("../../pages/DeliveryHistory/HistoryListPage"));
    const Profile = lazy(() => import("../../pages/Driver/DriverProfile"));
    const EditProfile = lazy(() => import("../../pages/Driver/EditProfile"));
    const RegisterVehicle = lazy(() => import("../../pages/Driver/RegisterVehicles"));
    const EditVehicle = lazy(() => import("../../pages/Driver/EditVehicles"));




    return [
        // {
        //     path: "list",
        //     element: (
        //         <Suspense fallback={Loading}>
        //             <RequestList />
        //         </Suspense>
        //     )
        // }, 
        {
            path: "detail/:requestId",
            element: (
                <Suspense fallback={Loading}>
                    <RequestDetail />
                </Suspense>
            )
        },
        {
            path: "ongoing/:driverId",
            element: (
                <Suspense fallback={Loading}>
                    <OnGoing />
                </Suspense>
            )
        },
        // {
        //     path: "review/:driverId",
        //     element: (
        //         <Suspense fallback={Loading}>
        //             <Review />
        //         </Suspense>
        //     )
        // },
        // {
        //     path: "report/:driverId",
        //     element: (
        //         <Suspense fallback={Loading}>
        //             <Report />
        //         </Suspense>
        //     )
        // },
        // {
        //     path: "calendar/:driverId/:month",
        //     element: (
        //         <Suspense fallback={Loading}>
        //             <Calender />
        //         </Suspense>
        //     )
        // },
        // {
        //     path: "history/:driverId",
        //     element: (
        //         <Suspense fallback={Loading}>
        //             <History />
        //         </Suspense>
        //     )
        // },
        {
            path: "profile",
            element: (
                <Suspense fallback={Loading}>
                    <Profile />
                </Suspense>
            )
        },
        {
            path: "editprofile",
            element: (
                <Suspense fallback={Loading}>
                    <EditProfile />
                </Suspense>
            )
        },
        {
            path: "registervehicle",
            element: (
                <Suspense fallback={Loading}>
                    <RegisterVehicle />
                </Suspense>
            )
        },
        {
            path: "editvehicle",
            element: (
                <Suspense fallback={Loading}>
                    <EditVehicle />
                </Suspense>
            )
        }
    ];
}
export default driverRouter;