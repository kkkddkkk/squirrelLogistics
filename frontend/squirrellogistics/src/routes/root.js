import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import paymentRouter from "./paymentRoutes/paymentRouter"

const Loading = <div>Loding...</div>
const Layout = lazy(() => import("../pages/Layout/Layout"));
const RegisterPage = lazy(() => import("../pages/Layout/RegisterPage"));
const Payment = lazy(() => import("../pages/Payment/Payment"));
const EstimatePage = lazy(() => import("../pages/estimate/estimateRouter"));

const root = createBrowserRouter([
    {
        path: "/",
        element: (
            <Suspense fallback={Loading}>
                <Layout></Layout>
            </Suspense>
        ),
        // children: registRouter()
    }, {
        path: "register",
        element: (
            <Suspense fallback={Loading}>
                <RegisterPage></RegisterPage>
            </Suspense>
        )
        // children: registRouter()
    }, {
        path: "payment",
        element: (
            <Suspense fallback={Loading}>
                <Payment></Payment>
            </Suspense>
        ),
        children: paymentRouter()
    }, {
        path: "estimate",
        element: <Suspense fallback={Loading}><EstimatePage /></Suspense>
    }

])
export default root;