import "react-datepicker/dist/react-datepicker.css"; // 필수, 이건 컴포넌트 구조를 위한 것
import "./HistoryCalendar.css"
import { Box, Button } from "@mui/material";
import { useState } from "react";
import DatePicker from "react-datepicker";


const HistoryCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const PsButton = ({ children, func }) => {
        return (
            <Button
                variant="contained"
                sx={{ width: "40%", minWidth: "110px"}}
                onClick={func}
            >
                {children}
            </Button>
        );
    }


    return (
        <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                inline
                className="historyCalendar"
            />
            <Box sx={{width:"100%", display:"flex", justifyContent:"space-around", marginTop: "5%"}} >
                <PsButton>내 신고목록</PsButton>
                <PsButton>내 리뷰목록</PsButton>
            </Box>

        </div>
    );
};

export default HistoryCalendar;