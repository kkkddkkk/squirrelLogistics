import { lazy, Suspense } from "react"

const Loading = <div>로딩중</div>

const History = lazy(() => import("../../pages/History/History"));

const ActualCalc = lazy(() => import("../../pages/ActualCalc/ActualCalc"));
const historyRouter = () => {
    return [{
        path: ``,
        element: <Suspense fallback={Loading}><History></History></Suspense>
    },{
        path: `actualCalc`,
        element: <Suspense fallback={Loading}><ActualCalc></ActualCalc></Suspense>
    }
    ]
}
export default historyRouter;


