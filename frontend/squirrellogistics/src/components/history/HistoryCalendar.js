import "react-datepicker/dist/react-datepicker.css"; // 필수, 이건 컴포넌트 구조를 위한 것
import "./HistoryCalendar.css"
import { Box, Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import { TwoBtns } from "../common/CommonForCompany";
import axios from "axios";
import { getHistoryDate } from "../../api/company/historyApi";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';


const HistoryCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [historyDate, setHistoryDate] = useState([]);
    const { moveToAnotherDay, moveToReportList, moveToReviewList } = useHistoryMove();
    const [markedDates, setMarkedDates] = useState([]);

    useEffect(() => {
        getHistoryDate()
            .then(data => {
                setHistoryDate(data);
            })
            .catch(err => {
                console.error("데이터 가져오기 실패", err);
            });
    }, []);

    useEffect(() => {
        if(!historyDate) return;
        setMarkedDates(historyDate.map(d => new Date(d)));
    }, [historyDate])

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

    const CalendarButton = ({ onClickFunc, disabledFunc, left }) => {
        return (
            <button
                onClick={onClickFunc}
                disabled={disabledFunc}
                style={{
                    border: "none",          // 테두리 제거
                    background: "transparent",// 배경 제거
                    padding: 0,               // 기본 여백 제거
                    cursor: disabledFunc ? "not-allowed" : "pointer",
                    display: "flex",          // 아이콘 정렬용
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {left ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}

            </button>
        )
    }

    const handleClickReportList = () => {
        moveToReportList();
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
                renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled
                }) => (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>

                        <CalendarButton onClickFunc={decreaseMonth} disabledFunc={prevMonthButtonDisabled}
                            left={true} />

                        <Box display="flex" gap={2}>
                            {/* 연도 선택 */}
                            <select
                                value={date.getFullYear()}
                                onChange={({ target: { value } }) => changeYear(Number(value))}
                                style={{
                                    border: "none",          // 테두리 제거
                                    background: "transparent",
                                    padding: "0 0.5rem",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    outline: "none",         // 포커스 시 테두리 제거
                                }}
                            >
                                {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i).map((y) => (
                                    <option
                                        key={y}
                                        value={y}
                                        style={{ fontSize: "1rem" }}   // 드롭다운 메뉴 폰트 작게
                                    >
                                        {y}년
                                    </option>
                                ))}
                            </select>

                            {/* 월 선택 */}
                            <select
                                value={date.getMonth()}
                                onChange={({ target: { value } }) => changeMonth(Number(value))}
                                style={{
                                    border: "none",          // 테두리 제거
                                    background: "transparent",
                                    padding: "0 0.5rem",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    outline: "none",         // 포커스 시 테두리 제거
                                }}
                            >
                                {[
                                    "1월", "2월", "3월", "4월", "5월", "6월",
                                    "7월", "8월", "9월", "10월", "11월", "12월"
                                ].map((m, i) => (
                                    <option
                                        key={i}
                                        value={i}
                                        style={{ fontSize: "1rem" }}
                                    >
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </Box>

                        <CalendarButton onClickFunc={increaseMonth} disabledFunc={nextMonthButtonDisabled} />
                    </div>
                )}
            />
            <Box sx={{ width: "100%", display: "flex", justifyContent: "space-around", marginTop: "5%" }} >
                <PsButton func={handleClickReportList}>내 신고목록</PsButton>
                <PsButton func={moveToReviewList}>내 리뷰목록</PsButton>
            </Box>
        </div>
    );
};

export default HistoryCalendar;