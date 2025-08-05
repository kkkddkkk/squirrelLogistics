import { Outlet, useNavigate } from "react-router-dom";
import { useCallback } from "react";

const IndexPage = () =>{

    const navigate = useNavigate();
    const handleClickList = useCallback(() => {
        navigate({ pathname: 'list' })
    });

    const handleClickAdd = useCallback(() => {
        navigate({ pathname: 'add' })
    });

    return (
   
            <div >
                <Outlet></Outlet>
            </div>
       
    );
}
export default IndexPage;