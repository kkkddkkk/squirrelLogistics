import { Suspense } from "react"

const paymentRouter = ()=>{
    return[
        {
            path:"list",
            element: <Suspense></Suspense>
        }
    ]
}