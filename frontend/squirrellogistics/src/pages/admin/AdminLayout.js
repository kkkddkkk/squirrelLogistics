import { Outlet } from "react-router-dom"
import Footer from "../Layout/Footer"
import Header from "../Layout/Header"

const AdminLayout=()=>{
    return(
        <>
            <Header/>
                <Outlet/>
            <Footer/>
        </>
    )
}

export default AdminLayout;