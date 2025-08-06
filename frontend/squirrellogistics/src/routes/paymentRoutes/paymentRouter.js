import { Children, lazy, Suspense } from "react"

const Loading = <div>로딩중</div>

const Payment =lazy(() => import("../../pages/Payment/Payment"));
const Success = lazy(() => import("../../pages/Payment/PaymentSuccess"));
const Reciept = lazy(() => import("../../pages/Payment/Reciept"));
const TransactionStatement = lazy(() => import("../../pages/Payment/TransactionStatement"));
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
    }, {
        path: `transactionStatement`,
        element: <Suspense fallback={Loading}><TransactionStatement></TransactionStatement></Suspense>
    }
    ]
}
export default paymentRouter;


