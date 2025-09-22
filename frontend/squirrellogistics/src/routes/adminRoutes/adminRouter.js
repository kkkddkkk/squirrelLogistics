// adminRoutes/adminRouter.js
import { lazy, Suspense } from "react";
const Loading = <div>로딩 중...</div>;

const UserList = lazy(() => import("../../pages/admin/UserList"));
const VehiclesPage = lazy(() => import("../../pages/admin/VehiclesPage"));
const TermsPage = lazy(() => import("../../pages/admin/TermsPage"));

export default function adminRouter() {
  return [
    {
      path: "users",
      element: (
        <Suspense fallback={Loading}>
          <UserList />
        </Suspense>
      ),
    },
    {
      path: "vehicles",
      element: (
        <Suspense fallback={Loading}>
          <VehiclesPage />
        </Suspense>
      ),
    },
    {
      path: "terms",
      element: (
        <Suspense fallback={Loading}>
          <TermsPage />
        </Suspense>
      ),
    },
  ];
}
