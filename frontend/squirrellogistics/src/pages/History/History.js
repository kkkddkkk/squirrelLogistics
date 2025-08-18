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
    const [todayList, setTodayList] = useState([]);

    useEffect(() => {
        if (!date) return;

        axios.get(`http://localhost:8080/api/public/companyHistory`, {
            params: { completedAt: date }
        }).then(res => {
            const formattedData = res.data.map(item => ({
                assignedId: item[0],
                startAddress: item[1],
                endAddress: item[2]
            }));
            setTodayList(formattedData);
        })
            .catch(err => console.error(err));
    }, [date])



    return (
        <Layout title={"이용기록"}>
            <Box width={"80%"}>
                <Grid container spacing={3}>
                    <Grid size={6}>
                        <HistoryCalendar/>
                    </Grid>
                    <Grid size={6} height={"65vh"} overflow={"auto"}>
                        {todayList.map((today) => (
                            <HistoryList
                                key={today.assignedId}
                                assignedId={today.assignedId}
                                start={today.startAddress.toString().slice(0, 10)+"..."}
                                end={today.endAddress.toString().slice(0, 10)+"..."}
                            />
                        ))}
                    </Grid>
                </Grid>
            </Box>

        </Layout>

    )
}

export default History;