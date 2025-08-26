import { Box, Grid } from "@mui/material";
import HistoryCalendar from "../../components/history/HistoryCalendar";
import HistoryList from "../../components/history/HistoryList";
import { Layout, NoneOfList } from "../../components/common/CommonForCompany";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getHistoryList } from "../../api/company/historyApi";
import useHistoryMove from "../../hook/historyHook/useHistoryMove";
import Logo from '../../components/common/squirrelLogisticsLogo.png';

const History = () => {
    const [params] = useSearchParams();
    const date = params.get("date");
    const [todayList, setTodayList] = useState([]);
    const [assignStatus, setAssignStatus] = useState([]);
    const { moveToMain } = useHistoryMove();
    const [dataLengths, setDataLengths] = useState(0);


    useEffect(() => {
        if (!date) return;
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return moveToMain();
        getHistoryList({ date, accessToken })
            .then(data => {
                console.log(data);
                setTodayList(data);
                setDataLengths(data.length);
            })
            .catch(err => {
                console.error("데이터 가져오기 실패", err);
            });

    }, [date]);


    useEffect(() => {
        const statuses = todayList?.map(today => {
            if (today.assignmentStatus === "ASSIGNED") return "예약";
            if (today.assignmentStatus === "IN_PROGRESS") return "배송중";
            if (today.assignmentStatus === "COMPLETED" && today.paymentStatus === "ALLCOMPLETED") return "배송완료";
            if (today.assignmentStatus === "COMPLETED" && today.paymentStatus !== "ALLCOMPLETED") return "미정산";
            if (today.assignmentStatus === "CANCELED" || today.assignmentStatus === "FAILED") return "취소";
            if (today.assignmentStatus === "UNKNOWN") return "";
            return "";
        });
        setAssignStatus(statuses); // 이제 상태는 배열
    }, [todayList]);



    return (
        <Layout title={"이용기록"}>
            <Box width={"80%"}>
                <Grid container spacing={3}>
                    <Grid size={6}>
                        <HistoryCalendar />
                    </Grid>
                    <Grid size={6} height={"65vh"} overflow={"auto"}>
                        {dataLengths === 0 ?
                            <NoneOfList logoSrc={Logo}>아직 이용기록이 없습니다.</NoneOfList> :
                            (todayList?.map((today, idx) => (
                                <HistoryList
                                    key={today.assignedId}
                                    assignedId={today.assignedId}
                                    start={today.startAddress.toString().slice(0, 10) + "..."}
                                    end={today.endAddress.toString().slice(0, 10) + "..."}
                                    assignStatus={assignStatus[idx]}
                                    paymentStatus={today.paymentStatus}
                                />
                            )))
                        }

                    </Grid>
                </Grid>
            </Box>

        </Layout>

    )
}

export default History;