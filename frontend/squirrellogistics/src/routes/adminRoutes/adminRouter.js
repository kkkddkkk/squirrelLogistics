import { lazy } from "react";

const LoginPage     = lazy(() => import("../../pages/admin/Auth/LoginPage"));
const RegisterPage  = lazy(() => import("../../pages/admin/Auth/RegisterPage"));
const Dashboard     = lazy(() => import("../../pages/admin/Dashboard/Dashboard"));

const FindIdPage = lazy(()=> import("../../pages/admin/Auth/FindIdPage"));
const PasswordResetPage = lazy(()=> import("../../pages/admin/Auth/PasswordResetPage"))

// Support 하위
const FAQList  = lazy(() => import("../../pages/admin/Support/FAQ/FAQList"));
const FAQForm  = lazy(() => import("../../pages/admin/Support/FAQ/FAQForm"));

const NoticeList  = lazy(() => import("../../pages/admin/Support/Notice/NoticeList"));
const NoticeForm  = lazy(() => import("../../pages/admin/Support/Notice/NoticeForm"));

const InquiryList = lazy(() => import("../../pages/admin/Support/Inquiry/InquiryList"));

const PolicyPage = lazy(() => import("../../pages/admin/Support/Policy/PolicyPage"));
//managemnet하위
const UserManagementList = lazy(() => import("../../pages/admin/Management/Users/UserManagementList"));
const UserForm = lazy(() => import("../../pages/admin/Management/Users/UserForm"));
const VehicleManagementList =lazy(()=> import("../../pages/admin/Management/Vehicles/VehicleManagementList"));
const VehicleForm =lazy(()=>import("../../pages/admin/Management/Vehicles/VehicleForm"));

const DeliveriesList = lazy(() => import("../../pages/admin/Management/Deliveries/DeliveriesList"));
const DeliveryForm   = lazy(() => import("../../pages/admin/Management/Deliveries/DeliveryForm"));

const SettlementList = lazy(() => import("../../pages/admin/Management/Settlement/SettlementList"));
const SettlementForm = lazy(() => import("../../pages/admin/Management/Settlement/SettlementForm"));

const BannerForm=lazy(()=> import("../../pages/admin/Management/Banners/BannerForm"));
const BannerList=lazy(()=> import("../../pages/admin/Management/Banners/BannerList"));



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
    {
  path: "management",
  children: [
    { path: "users", element: <UserManagementList /> },
    { path: "users/new", element: <UserForm /> },
    { path: "users/:id", element: <UserForm /> },

    {path: "vehicles", element: <VehicleManagementList/>},
    {path:"vehicles/new",element:<VehicleForm/>},
    {path:"vehicles/:id",element:<VehicleForm/>},

    { path: "deliveries",     element: <DeliveriesList/>},
    { path: "deliveries/new", element: <DeliveryForm/>},
    { path: "deliveries/:id", element: <DeliveryForm/>},

     { path: "settlement",      element: <SettlementList/>},
    { path: "settlement/new",  element: <SettlementForm/>},
    { path: "settlement/:id",  element: <SettlementForm/>},

    {
      path: "banners",
      element: <BannerList />,
    },
    {
      path: "banners/new",
      element: <BannerForm />,
    },
    {
      path: "banners/:id",
      element: <BannerForm />,
    },
    
  ]
},



  ];
}
