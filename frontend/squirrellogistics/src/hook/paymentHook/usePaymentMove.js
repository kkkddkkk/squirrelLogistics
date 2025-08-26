import {useNavigate} from "react-router-dom";

const usePaymentMove=()=>{
    const navigate = useNavigate();
    const moveToMain = ()=>{
        navigate({pathname: `/`});
    }
    const moveToHistory = ()=>{//임시
        navigate({pathname: `/company/history`});
    }
    const moveToSecondPayment=(state)=>{
        navigate({pathname: `/company/payment`, search: `?prepaidId=${state}`});
    }
    const moveToSuccess = ({state, paymentId})=>{
        navigate({pathname: `/company/paymentSuccess`, search: `?paymentId=${paymentId}&success=${state}`});
    }
    const moveBack = ()=>{
        navigate(-1);
    }
    const moveToActualCalc=(assignedId)=>{
        navigate(`/company/actualCalc?assignedId=${assignedId}`)
    }

    return {moveToMain, moveToHistory, moveToSuccess, moveBack, moveToSecondPayment, moveToActualCalc}
}
export default usePaymentMove;

