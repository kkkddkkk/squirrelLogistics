
import { lazy, Suspense } from "react";

const Loading = <div>로딩 중...</div>;
const Admin = lazy(() => import("../../pages/admin"));

const adminRouter = () => {
  return [
    // {
    //   path: "/admin",
    //   element: <Suspense fallback={Loading}><Admin /></Suspense>,
    // },
  ];
};

export default adminRouter;
