import { Box, Grid, ListItem } from "@mui/material";
import HistoryCalendar from "../../components/history/HistoryCalendar";
import HistoryList from "../../components/history/HistoryList";
import { Layout } from "../../components/common/CommonForCompany";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios"

const History = () => {
    const [params] = useSearchParams();
    const date = params.get("date");
    const [isreviewed, setIsReviewed] = useState(true);
    const [historyList, setHistoryList] = useState([]);
    const [todayList, setTodayList] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/public/companyHistory`)
            .then(res => {
                setHistoryList(res.data);
                const filtered = res.data.filter(data => data.completedAt && data.completedAt.slice(0, 10) === date);
                setTodayList(filtered);
            })
            .catch(err => console.error(err));
    }, []);  //최초 한 번만 실행

    useEffect(() => {
        if (!date) return;

        axios.get(`http://localhost:8080/api/public/companyHistory`, {
            params: { date }
        }).then(res => {
            console.log(res.data);
            const filtered = res.data.filter(data => date === data.completedAt.slice(0, 10));
            setTodayList(filtered);
        })
            .catch(err => console.error(err));
    }, [date])



    return (
        <Layout title={"이용기록"}>
            <Box width={"80%"}>
                <Grid container spacing={3}>
                    <Grid size={6}>
                        <HistoryCalendar historyList={historyList}></HistoryCalendar>
                    </Grid>
                    <Grid size={6} height={"65vh"} overflow={"auto"}>
                        {todayList.map((today) => (
                            
                            <HistoryList
                                key={today.assignedId}
                                assignedId={today.assignedId}
                                start={today.startAddress.slice(0, 13) + "..."}
                                end={today.endAddress.slice(0, 13) + "..."}
                                stopOver1={today.waypoints[0] ? today.waypoints[0].address : ''}
                                stopOver2={today.waypoints[1] ? today.waypoints[1].address : ''}
                                stopOver3={today.waypoints[2] ? today.waypoints[2].address : ''}
                                mountainous={today.mountainous}
                                caution={today.caution}
                                actualFee={today.actualFee}
                                driverName={today.driverName}
                                carName={today.carName}
                                isreviewed={isreviewed}
                                setIsReviewed={setIsReviewed}
                                reviewId={today.reviewId}
                                rate={today.rating}
                                reason={today.reason}
                            // 필요한 다른 props도 같이 넘기기
                            />
                        ))}
                    </Grid>
                </Grid>
            </Box>

        </Layout>

    )
}

export default History;