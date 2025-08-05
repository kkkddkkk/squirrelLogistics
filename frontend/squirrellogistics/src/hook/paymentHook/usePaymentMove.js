import {useNavigate} from "react-router-dom";

const usePaymentMove=()=>{
    const navigate = useNavigate();
    const moveToMain = ()=>{
        navigate({pathname: `../main`});
    }
    const moveToHistory = ()=>{
        navigate({pathname: `../history`});
    }
    const moveToSuccess = (state)=>{
        navigate({pathname: `/paymentSuccess`, search: `?success=${state}`});
    }
    const moveBack = ()=>{
        navigate(-1);
    }
    return {moveToMain, moveToHistory, moveToSuccess, moveBack}
}
export default usePaymentMove;

