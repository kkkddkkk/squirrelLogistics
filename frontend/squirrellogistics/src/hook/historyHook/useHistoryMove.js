import { useNavigate } from "react-router-dom";

const useHistoryMove = () => {
    const navigate = useNavigate();

    const moveToAnotherDay = (state) => {
        navigate({ pathname: `/company/history`, search: `?date=${state}` });
    }
    const moveBack = () => {
        navigate(-1);
    }

    const moveToReportList = () => {
        navigate({ pathname: `/company/reportList` })
    }
    const moveToReviewList = () => {
        navigate({ pathname: `/company/reviewList` })
    }
    const moveToDetailHistory = (assignId)=>{
        navigate({ pathname: `/company/detailHistory`, search: `?assignId=${assignId}` })
    }


    return { moveToAnotherDay, moveBack, moveToReportList, moveToReviewList, moveToDetailHistory }
}
export default useHistoryMove;