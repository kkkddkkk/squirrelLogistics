import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import paymentRouter from "./paymentRoutes/paymentRouter"
import driverRouter from "./driverRoutes/driverRouter";
import historyRouter from "./historyRoutes/historyRouter";

const Loading = <div>Loding...</div>
const Layout = lazy(() => import("../pages/Layout/Layout"));
const RegisterPage = lazy(() => import("../pages/Layout/RegisterPage"));
const Payment = lazy(() => import("../pages/Payment/PaymentLayout"));
const EstimatePage = lazy(() => import("../pages/estimate/EstimatePage"));
const DriverIndex = lazy(() => import("../pages/Driver/IndexPage"));
const AdminPage = lazy(() => import("../pages/Support/SupportLayout"));
const History = lazy(() => import("../pages/History/HistoryLayout"));
const DriverSearchPage = lazy(() => import("../pages/driversearch/DriverSearchPage"));

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
        ),
        children: paymentRouter()
    }, {
        path: "/history",
        element: (
            <Suspense fallback={Loading}>
                <History></History>
            </Suspense>
        ),
        children: historyRouter()
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
        path: "/driver",
        element: (
            <Suspense fallback={Loading}>
                <DriverIndex />
            </Suspense>
        ),
        children: driverRouter()
    },
    {
        path: "/driversearch",
        element: (
            <Suspense fallback={Loading}>
                <DriverSearchPage></DriverSearchPage>
            </Suspense>
        )
    }



])
export default root;