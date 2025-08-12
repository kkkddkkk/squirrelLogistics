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


    return { moveToAnotherDay, moveBack, moveToReportList, moveToReviewList }
}
export default useHistoryMove;