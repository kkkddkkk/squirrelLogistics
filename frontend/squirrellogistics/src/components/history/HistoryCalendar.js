import "react-datepicker/dist/react-datepicker.css"; // 필수, 이건 컴포넌트 구조를 위한 것
import "./HistoryCalendar.css"
import { Box, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import { getHistoryDate } from "../../api/company/historyApi";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CommonList from "../common/CommonList";
import { theme, applyThemeToCssVars } from "../common/CommonTheme";


const HistoryCalendar = () => {
    const thisTheme = useTheme();

    useEffect(() => {
        const root = document.documentElement;
        
        root.style.setProperty("--primary-main", thisTheme.palette.primary.main);
        root.style.setProperty("--primary-dark", thisTheme.palette.primary.dark);
        root.style.setProperty("--secondary-main", thisTheme.palette.secondary.main);
        root.style.setProperty("--background-default", thisTheme.palette.background.default);
        root.style.setProperty("--background-paper", thisTheme.palette.background.paper);
        root.style.setProperty("--text-primary", thisTheme.palette.text.primary);
        root.style.setProperty("--text-secondary", thisTheme.palette.text.secondary);

    }, [thisTheme.palette.primary.main])

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [historyDate, setHistoryDate] = useState([]);
    const { moveToAnotherDay } = useHistoryMove();
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
        if (!historyDate) return;
        setMarkedDates(historyDate.map(d => new Date(d)));
    }, [historyDate])

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
                    color: thisTheme.palette.text.primary
                }}
            >
                {left ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}

            </button>
        )
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
            <CommonList>
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
                                        outline: "none",        // 포커스 시 테두리 제거
                                        color: thisTheme.palette.text.primary 
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
                                        color: thisTheme.palette.text.primary 
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
            </CommonList>
        </div>
    );
};

export default HistoryCalendar;