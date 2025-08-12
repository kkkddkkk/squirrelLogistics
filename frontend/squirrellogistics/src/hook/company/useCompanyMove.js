import {useNavigate} from "react-router-dom";

const useCompanyMove=()=>{
    const navigate = useNavigate();

    const moveToReportList = ()=>{
        navigate({pathname: `/company/reportList`});
    }
    const moveBack = ()=>{
        navigate(-1);
    }

    return {moveToReportList, moveBack}
}
export default useCompanyMove;