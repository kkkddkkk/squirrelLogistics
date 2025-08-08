import {useNavigate} from "react-router-dom";

const useHistoryMove=()=>{
    const navigate = useNavigate();

    const moveToAnotherDay = (state)=>{
        navigate({pathname: `/company/history`, search: `?date=${state}`});
    }
    const moveBack = ()=>{
        navigate(-1);
    }

    return {moveToAnotherDay, moveBack}
}
export default useHistoryMove;