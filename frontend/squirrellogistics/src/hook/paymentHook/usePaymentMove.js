import {useNavigate} from "react-router-dom";

const usePaymentMove=()=>{
    const navigate = useNavigate();
    const moveToMain = ()=>{
        navigate({pathname: `../main`});
    }
    const moveToHistory = ()=>{//임시
        navigate({pathname: `/payment/history`});
    }
    const moveToSuccess = (state)=>{
        navigate({pathname: `/payment/paymentSuccess`, search: `?success=${state}`});
    }
    const moveBack = ()=>{
        navigate(-1);
    }

    return {moveToMain, moveToHistory, moveToSuccess, moveBack}
}
export default usePaymentMove;

