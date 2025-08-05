import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import paymentRouter from "./paymentRoutes/paymentRouter"

const Loading = <div>Loding...</div>
const Layout = lazy(() => import("../pages/Layout/Layout"));
const RegisterPage = lazy(() => import("../pages/Layout/RegisterPage"));
const Payment = lazy(() => import("../pages/Payment/Payment"));
const EstimatePage = lazy(() => import("../pages/estimate/EstimatePage"));
// const DriverIndex = lazy(() => import("../pages/Driver/DriverIndexPage"));
const AdminPage = lazy(() => import("../pages/Support/SupportLayout"));
const RequestDetailPage = lazy(() => import("../pages/DeliveryRequest/RequestDetailPage"));
const DriverProfile = lazy(() => import("../pages/Driver/DriverProfile"));

const root = createBrowserRouter([
    {
        path: "",
        element: (
            <Suspense fallback={Loading}>
                <Layout></Layout>
            </Suspense>
        ),
        // children: registRouter()
    }, {
        path: "/register",
        element: (
            <Suspense fallback={Loading}>
                <RegisterPage></RegisterPage>
            </Suspense>
        )
        // children: registRouter()
    }, {
        path: "/payment",
        element: (
            <Suspense fallback={Loading}>
                <Payment></Payment>
            </Suspense>
        )
    }, {
        path: "/estimate",
        element: (
            <Suspense fallback={Loading}>
                <EstimatePage></EstimatePage>
            </Suspense>
        )
    }, {
        path: "/admin",
        element: (
            <Suspense fallback={Loading}>
                <AdminPage></AdminPage>
            </Suspense>
        )
    }, {
        path: "/deliveryRequest",
        element: (
            <Suspense fallback={Loading}>
                <RequestDetailPage></RequestDetailPage>
            </Suspense>
        )
    }, {
        path: "/driverProfile",
        element: (
            <Suspense fallback={Loading}>
                <DriverProfile></DriverProfile>
            </Suspense>
        )
    }



])
export default root;