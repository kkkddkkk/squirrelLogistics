import "react-datepicker/dist/react-datepicker.css"; // 필수, 이건 컴포넌트 구조를 위한 것
import "./HistoryCalendar.css"
import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import { TwoBtns } from "../common/CommonForCompany";
import axios from "axios";


const HistoryCalendar = ({ historyList }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [historyDate, setHistoryDate] = useState([]);
    const { moveToAnotherDay, moveToReportList, moveToReviewList } = useHistoryMove();

    useEffect(() => {//날짜목록을 historyDate에 set.
        axios.get(`http://localhost:8080/api/public/companyHistory/calendar`)
            .then(res => {
                setHistoryDate(res.data);
            })
            .catch(err => console.error(err));
    }, []); //최초 한 번만 실행
    const markedDates = historyDate.map(d => new Date(d));

    const PsButton = ({ children, func }) => {
        return (
            <Button
                variant="contained"
                sx={{ width: "40%", minWidth: "110px" }}
                onClick={func}
            >
                {children}
            </Button>
        );
    }

    let clickedMonth;
    let clickedDate;
    let today = new Date();
    let todayFullDate = `${today.getFullYear()}-${(today.getMonth() + 1) > 10 ? today.getMonth() + 1 : `0${today.getMonth() + 1}`}-${today.getDate() > 10 ? today.getDate() : `0${today.getDate()}`}`;
    const [clickedFullDate, setClickedFullDate] = useState(todayFullDate);
    const handleChangeDate = (date) => {//날짜 클릭 시 clickedFullDate값 변경
        setSelectedDate(date);

        if (date.getMonth() + 1 < 10) clickedMonth = `0${date.getMonth() + 1}`;
        else clickedMonth = date.getMonth() + 1;

        if (date.getDate() < 10) clickedDate = `0${date.getDate()}`;
        else clickedDate = date.getDate();
        setClickedFullDate(`${date.getFullYear()}-${clickedMonth}-${clickedDate}`);
    }

    useEffect(() => {//날짜 클릭 시 랜더링
        moveToAnotherDay(clickedFullDate);//path에 date 파라미터 추가
    }, [clickedFullDate]);

    return (
        <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
            <DatePicker
                selected={selectedDate}
                onChange={handleChangeDate}
                inline
                highlightDates={[
                    { "react-datepicker__day--highlighted-custom": markedDates }
                ]}
            />
            <Box sx={{ width: "100%", display: "flex", justifyContent: "space-around", marginTop: "5%" }} >
                <PsButton func={moveToReportList}>내 신고목록</PsButton>
                <PsButton func={moveToReviewList}>내 리뷰목록</PsButton>
            </Box>

        </div>
    );
};

export default HistoryCalendar;