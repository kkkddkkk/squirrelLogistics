import { lazy, Suspense } from "react"


const { createBrowserRouter } = require("react-router-dom");
const Loading = "<div>로딩중</div>"

const Payment = lazy(() => import("../../pages/Payment/Payment"));
const Success = lazy(() => import("../../pages/Payment/PaymentSuccess"));
const Reciept = lazy(() => import("../../pages/Payment/Reciept"));
const paymentRouter = createBrowserRouter([
    {
        path: `/paymentSuccess`,
        element: <Suspense fallback={Loading}><Success></Success></Suspense>
    }, {
        path: `/reciept`,
        element: <Suspense fallback={Loading}><Reciept></Reciept></Suspense>
    }

])
export default paymentRouter;


