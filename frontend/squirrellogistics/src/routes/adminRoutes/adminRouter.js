import { lazy } from "react";

const LoginPage     = lazy(() => import("../../pages/admin/Auth/LoginPage"));
const RegisterPage  = lazy(() => import("../../pages/admin/Auth/RegisterPage"));
const Dashboard     = lazy(() => import("../../pages/admin/Dashboard/Dashboard"));

const FindIdPage = lazy(()=> import("../../pages/admin/Auth/FindIdPage"));
const PasswordResetPage = lazy(()=> import("../../pages/admin/Auth/PasswordResetPage"));

// Support 하위
const FAQList  = lazy(() => import("../../pages/admin/Support/FAQ/FAQList"));
const FAQForm  = lazy(() => import("../../pages/admin/Support/FAQ/FAQForm"));

const NoticeList  = lazy(() => import("../../pages/admin/Support/Notice/NoticeList"));
const NoticeForm  = lazy(() => import("../../pages/admin/Support/Notice/NoticeForm"));

const InquiryList = lazy(() => import("../../pages/admin/Support/Inquiry/InquiryList"));
const InquiryDetail = lazy(() => import("../../pages/admin/Support/Inquiry/InquiryDetail"));

const PolicyList = lazy(() => import("../../pages/admin/Support/Policy/PolicyList"));
const PolicyForm = lazy(() => import("../../pages/admin/Support/Policy/PolicyForm"));

const ReviewList = lazy(() => import("../../pages/admin/Support/Review/ReviewList"));
const ReviewForm = lazy(() => import("../../pages/admin/Support/Review/ReviewForm"));
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
    
    {path: "find-id", element:<FindIdPage/>},
    {path: "password-reset", element:<PasswordResetPage/>},
    
      { path: "dashboard",   element: <Dashboard /> },
        { path: "support/faq",       element: <FAQList /> },
        { path: "support/faq/new",   element: <FAQForm /> },
        { path: "support/faq/:id",   element: <FAQForm /> },

        { path: "support/notices",      element: <NoticeList /> },
        { path: "support/notices/new",  element: <NoticeForm /> },
        { path: "support/notices/:id",  element: <NoticeForm /> },

         { path: "support/inquiry", element: <InquiryList /> },
         { path: "support/inquiry/:id", element: <InquiryDetail /> },

         { path: "support/policy",  element: <PolicyList /> },
         { path: "support/policy/new",  element: <PolicyForm /> },
         { path: "support/policy/:id",  element: <PolicyForm /> },
         
                             { path: "management/review",  element: <ReviewList /> },
          { path: "management/review/:id",  element: <ReviewForm /> },
      
    
    { path: "management/users", element: <UserManagementList /> },
    { path: "management/users/new", element: <UserForm /> },
    { path: "management/users/:id", element: <UserForm /> },

    {path: "management/vehicles", element: <VehicleManagementList/>},
    {path:"management/vehicles/new",element:<VehicleForm/>},
    {path:"management/vehicles/:id",element:<VehicleForm/>},

    { path: "management/deliveries",     element: <DeliveriesList/>},
    { path: "management/deliveries/new", element: <DeliveryForm/>},
    { path: "management/deliveries/:id", element: <DeliveryForm/>},

     { path: "management/settlement",      element: <SettlementList/>},
    { path: "management/settlement/new",  element: <SettlementForm/>},
    { path: "management/settlement/:id",  element: <SettlementForm/>},

    {path: "management/banners", element: <BannerList />},
    { path: "management/banners/new", element: <BannerForm />},
    {path: "management/banners/:id", element: <BannerForm />},
    


  ];
};
