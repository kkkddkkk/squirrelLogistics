import "react-datepicker/dist/react-datepicker.css"; // 필수, 이건 컴포넌트 구조를 위한 것
import "./HistoryCalendar.css"
import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import { TwoBtns } from "../common/CommonForCompany";


const HistoryCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const {moveToAnotherDay} = useHistoryMove();

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

    // 임시 날짜 리스트
    const markedDatesFromDB = ["2025-08-01", "2025-08-04", "2025-08-05"];
    const markedDates = markedDatesFromDB.map(d => new Date(d));

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
                <PsButton>내 신고목록</PsButton>
                <PsButton>내 리뷰목록</PsButton>
            </Box>

        </div>
    );
};

export default HistoryCalendar;