import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import driverRouter from "./driverRoutes/driverRouter";
import adminRouter from "./adminRoutes/adminRouter";
import companyRouter from "./company/companyRouter";
import { ScrollShell } from "../components/common/ScrollToTop";

const Loading = <div>Loading...</div>
const Layout = lazy(() => import("../pages/Layout/Layout"));
const RegisterPage = lazy(() => import("../pages/Layout/RegisterPage"));
const EstimatePage = lazy(() => import("../pages/estimate/EstimatePage_new"));
const DriverIndex = lazy(() => import("../pages/Driver/IndexPage"));
const DriverSearchPage = lazy(() => import("../pages/driversearch/DriverSearchPage"));
const AdminPage = lazy(() => import("./../components/admin/AdminLayout"));
const Company = lazy(() => import("../pages/company/CompanyLayout"));
const Reciept = lazy(() => import("../pages/Payment/Reciept"));
const TransactionStatement = lazy(() => import("../pages/Payment/TransactionStatement"));
const OAuthSuccess = lazy(() => import("../api/user/OAuthSuccess"));
const OAuthBridge = lazy(() => import("../pages/Layout/error/OAuthBridge"));

const root = createBrowserRouter([
    {
        path: "/",
        element: <ScrollShell />,          // ✅ 여기서 모든 자식 라우트에 대해 스크롤 맨 위 처리
        children: [
            {
                path: "",
                element: (
                    <Suspense fallback={Loading}>
                        <Layout></Layout>
                    </Suspense>
                ),
                // children: registRouter()
            },{
                path: "/oauth/success",
                element: (
                    <Suspense fallback={Loading}>
                        <OAuthBridge></OAuthBridge>
                    </Suspense>
                )
                // children: registRouter()
            },{
                path: "/oauth/failure",
                element: (
                    <Suspense fallback={Loading}>
                        <OAuthBridge></OAuthBridge>
                    </Suspense>
                )
                // children: registRouter()
            },{
                path: "/register",
                element: (
                    <Suspense fallback={Loading}>
                        <RegisterPage></RegisterPage>
                    </Suspense>
                )
                // children: registRouter()
            }, {
                path: "/company",
                element: (
                    <Suspense fallback={Loading}>
                        <Company></Company>
                    </Suspense>
                ),
                children: companyRouter()
            }, {
                path: "/company/reciept",
                element: (
                    <Suspense fallback={Loading}>
                        <Reciept></Reciept>
                    </Suspense>
                )
            }, {
                path: "/company/transactionStatement",
                element: (
                    <Suspense fallback={Loading}>
                        <TransactionStatement></TransactionStatement>
                    </Suspense>
                )
            }, {
                path: "/estimate",
                element: (
                    <Suspense fallback={Loading}>
                        <EstimatePage></EstimatePage>
                    </Suspense>
                )
            }, {
                path: "/driver",
                element: (
                    <Suspense fallback={Loading}>
                        <DriverIndex />
                    </Suspense>
                ),
                children: driverRouter()
            },
            {
                path: "/driversearch",
                element: (
                    <Suspense fallback={Loading}>
                        <DriverSearchPage></DriverSearchPage>
                    </Suspense>
                ),
            },
            {
                path: "/admin",
                element: (
                    <Suspense fallback={Loading}>
                        <AdminPage></AdminPage>
                    </Suspense>
                ),
                children: adminRouter()
            },
            {
                path: "/oauth/success",
                element: (
                    <Suspense fallback={Loading}>
                        <OAuthSuccess />
                    </Suspense>
                ),
            },
        ],
    },
]);
export default root;