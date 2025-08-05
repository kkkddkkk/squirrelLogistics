import { lazy, Suspense } from "react"

const Loading = <div>로딩중</div>

const History = lazy(() => import("../../pages/History/History"));
const historyRouter = () => {
    return [{
        path: ``,
        element: <Suspense fallback={Loading}><History></History></Suspense>
    }
    ]
}
export default historyRouter;


