// adminRoutes/adminRouter.js
import { lazy, Suspense } from "react";
const Loading = <div>로딩 중...</div>;

const UserList = lazy(() => import("../../pages/admin/UserList"));
const VehiclesPage = lazy(() => import("../../pages/admin/VehiclesPage"));

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
  ];
}
