import { Outlet } from "react-router-dom"
import Footer from "../Layout/Footer"
import Header from "../Layout/Header"

const CompanyLayout=()=>{
    return(
        <>
            <Header/>
                <Outlet/>
            <Footer/>
        </>
    )
}

export default CompanyLayout;