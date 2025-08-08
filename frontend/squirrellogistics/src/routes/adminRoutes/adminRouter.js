import { lazy } from "react";

const LoginPage     = lazy(() => import("../../pages/admin/Auth/LoginPage"));
const RegisterPage  = lazy(() => import("../../pages/admin/Auth/RegisterPage"));
const Dashboard     = lazy(() => import("../../pages/admin/Dashboard/Dashboard"));
const SupportLayout = lazy(() => import("../../pages/admin/Support/SupportLayout"));
const FindIdPage = lazy(()=> import("../../pages/admin/Auth/FindIdPage"));
const PasswordResetPage = lazy(()=> import("../../pages/admin/Auth/PasswordResetPage"))

// Support 하위
const FAQList  = lazy(() => import("../../pages/admin/Support/FAQ/FAQList"));
const FAQForm  = lazy(() => import("../../pages/admin/Support/FAQ/FAQForm"));
const NoticeList  = lazy(() => import("../../pages/admin/Support/Notice/NoticeList"));
const NoticeForm  = lazy(() => import("../../pages/admin/Support/Notice/NoticeForm"));
const InquiryList = lazy(() => import("../../pages/admin/Support/Inquiry/InquiryList"));
const PolicyPage = lazy(() => import("../../pages/admin/Support/Policy/PolicyPage"));
// Inquiry, Policy도 동일하게 import…

export default function adminRouter() {
  return [
    { path: "",       element: <LoginPage /> },
    { path: "signup",      element: <RegisterPage /> },
    { path: "dashboard",   element: <Dashboard /> },
    {path: "find-id", element:<FindIdPage/>},
    {path: "password-reset", element:<PasswordResetPage/>},

    // 고객지원 전체를 SupportLayout 아래에 중첩
    {
      path: "support",
      element: <SupportLayout />,
      children: [
        { path: "faq",       element: <FAQList /> },
        { path: "faq/new",   element: <FAQForm /> },
        { path: "faq/:id",   element: <FAQForm /> },

        { path: "notices",      element: <NoticeList /> },
        { path: "notices/new",  element: <NoticeForm /> },
        { path: "notices/:id",  element: <NoticeForm /> },

         { path: "inquiry", element: <InquiryList /> },
         { path: "policy",  element: <PolicyPage /> },
      ]
    },

    // 관리(Manage) 섹션이 따로 있다면 여기서 manageRouter() 불러와도 됩니다
  ];
}
