import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import HistoryCalendar from "../../components/history/HistoryCalendar";
import HistoryList from "../../components/history/HistoryList";
import { Layout, NoneOfList, OneBtnAtRight } from "../../components/common/CommonForCompany";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getHistoryList } from "../../api/company/historyApi";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import Logo from '../../components/common/squirrelLogisticsLogo.png';
import darkLogo from '../../components/common/squirrelLogisticsLogo_dark.png';
import { CommonTitle } from "../../components/common/CommonText";
import usePaymentMove from "../../hook/paymentHook/usePaymentMove";
import LoadingComponent from "../../components/common/LoadingComponent";
import { ButtonContainer, OneButtonAtRight, Two100Buttons, TwoButtonsAtRight } from "../../components/common/CommonButton";

const History = () => {
    const [params] = useSearchParams();
    const date = params.get("date");
    const [todayList, setTodayList] = useState([]);
    const [assignStatus, setAssignStatus] = useState([]);
    const { moveToMain } = usePaymentMove();
    const { moveBack, moveToReportList, moveToReviewList, moveToMyPage } = useHistoryMove();
    const [dataLengths, setDataLengths] = useState(0);
    const [loading, setLoading] = useState(false);

    const thisTheme = useTheme();

    const isDeskTop = useMediaQuery(thisTheme.breakpoints.up('lg'));
    const isTablet = useMediaQuery(thisTheme.breakpoints.between('md', 'lg'));
    const isMobile = useMediaQuery(thisTheme.breakpoints.down('sm'));

    const calendarWidth = isDeskTop ? '400px' : isTablet ? '400px' : '300px';
    const listWidth = isDeskTop ? '550px' : isTablet ? '400px' : '300px';

    useEffect(() => {
        setLoading(true);
        if (!date) return;
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return moveToMain();
        getHistoryList({ date, accessToken })
            .then(data => {
                setTodayList(data);
                setDataLengths(data.length);
            })
            .catch(err => {
            }).finally(() => setLoading(false));

    }, [date]);


    useEffect(() => {
        const statuses = todayList?.map(today => {
            if (today.assignmentStatus === "ASSIGNED") return "예약";
            if (today.assignmentStatus === "IN_PROGRESS") return "배송중";
            if (today.assignmentStatus === "COMPLETED" && today.paymentStatus === "ALLCOMPLETED") return "배송완료";
            if (today.assignmentStatus === "COMPLETED" && today.paymentStatus !== "ALLCOMPLETED") return "미정산";
            if ((today.assignmentStatus === "CANCELED" || today.assignmentStatus === "FAILED") && today.paymentStatus === "ALLCOMPLETED") return "환불완료";
            else if (today.assignmentStatus === "CANCELED" || today.assignmentStatus === "FAILED") return "취소";
            if (today.assignmentStatus === "UNKNOWN") return "요청됨";
            return "";
        });
        setAssignStatus(statuses); // 이제 상태는 배열
    }, [todayList]);

    function cutAddress(addr) {
        const tokens = addr.split(" "); // 띄어쓰기 단위로 나누기
        let result = [];

        for (let t of tokens) {
            result.push(t);
            if (t.endsWith("구")) break; // 토큰이 "구"로 끝날 때만 멈춤
        }

        return result.join(" ");
    }


    return (
        <>
            <LoadingComponent open={loading} text={`${date}의 이용기록을 불러오는 중...`}></LoadingComponent>
            <CommonTitle>이용기록</CommonTitle>
            <Grid container spacing={3} flexWrap={"wrap"} paddingLeft={"10%"} paddingRight={"10%"} justifyContent="center">
                <Grid item xs={12} md={4} display="flex" flexDirection="column" >
                    <HistoryCalendar width={calendarWidth} />
                </Grid>
                <Grid item xs={12} md={8} height={isMobile?"":"50vh"} maxHeight={isMobile?"50vh":""} overflow={"auto"} display="flex" flexDirection="column">
                    {dataLengths === 0 ?
                        <NoneOfList logoSrc={thisTheme.palette.mode === "light" ? Logo : darkLogo}>아직 이용기록이 없습니다.</NoneOfList> :
                        (todayList?.map((today, idx) => (
                            <HistoryList
                                key={today.assignedId}
                                assignedId={today.assignedId}
                                start={isMobile?cutAddress(today.startAddress):today.startAddress}
                                end={isMobile?cutAddress(today.endAddress):today.endAddress}
                                assignStatus={assignStatus[idx]}
                                paymentStatus={today.paymentStatus}
                                width={listWidth}
                                isMobile={isMobile}
                            />
                        )))
                    }
                </Grid>
                <Grid item xs={12} md={4} display={"flex"} justifyContent={"center"}>
                    <ButtonContainer width={calendarWidth}>
                        <Two100Buttons
                            leftTitle={"내 신고목록"}
                            leftClickEvent={() => moveToReportList()}

                            rightTitle={"내 리뷰목록"}
                            rightClickEvent={() => moveToReviewList()}
                            gap={2}
                        />
                    </ButtonContainer>
                </Grid>
                <Grid item xs={12} md={8} marginBottom={10}>
                    <ButtonContainer width={listWidth}>
                        {isMobile ?
                            <Two100Buttons
                                leftTitle={"메인화면"}
                                leftClickEvent={() => moveToMain()}
                                rightTitle={"마이페이지"}
                                rightClickEvent={() => moveToMyPage()}
                                gap={2}
                            />
                            :
                            <TwoButtonsAtRight
                                leftTitle={"메인화면"}
                                leftClickEvent={() => moveToMain()}
                                rightTitle={"마이페이지"}
                                rightClickEvent={() => moveToMyPage()}
                                gap={2}
                            />
                        }

                    </ButtonContainer>
                </Grid>
            </Grid>
        </>
    )
}

export default History;