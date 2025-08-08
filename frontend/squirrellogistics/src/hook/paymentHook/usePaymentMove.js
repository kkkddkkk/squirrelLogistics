import {useNavigate} from "react-router-dom";

const usePaymentMove=()=>{
    const navigate = useNavigate();
    const moveToMain = ()=>{
        navigate({pathname: `/`});
    }
    const moveToHistory = ()=>{//임시
        navigate({pathname: `/company/history`});
    }
    const moveToPayment=()=>{
        navigate({pathname: `/company/payment`});
    }
    const moveToSuccess = (state)=>{
        navigate({pathname: `/company/paymentSuccess`, search: `?success=${state}`});
    }
    const moveBack = ()=>{
        navigate(-1);
    }

    return {moveToMain, moveToHistory, moveToSuccess, moveBack, moveToPayment}
}
export default usePaymentMove;

