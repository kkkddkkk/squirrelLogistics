import { lazy, Suspense } from "react"

const Loading = <div>로딩중</div>

const Payment =lazy(() => import("../../pages/Payment/Payment"));
const Success = lazy(() => import("../../pages/Payment/PaymentSuccess"));
const Reciept = lazy(() => import("../../pages/Payment/Reciept"));
const paymentRouter = () => {
    return [{
        path: ``,
        element: <Suspense fallback={Loading}><Payment></Payment></Suspense>
    }, {
        path: `paymentSuccess`,
        element: <Suspense fallback={Loading}><Success></Success></Suspense>
    }, {
        path: `reciept`,
        element: <Suspense fallback={Loading}><Reciept></Reciept></Suspense>
    }
    ]
}
export default paymentRouter;


