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

    useEffect(() => {
        if (!date) return;

        axios.get(`http://localhost:8080/api/public/companyHistory`, {
            params: { date } 
        }).then(res => {
            setHistoryList(res.data)
            console.log(res.data);
        })
            .catch(err => console.error(err));

    }, [date])


    return (
        <Layout title={"이용기록"}>
            <Grid container spacing={3}>
                <Grid size={6}>
                    <HistoryCalendar></HistoryCalendar>
                </Grid>
                <Grid size={6}>
                    <HistoryList
                        stopOver1={"stopOver1"}
                        stopOver2={"stopOver2"}
                        stopOver3={"stopOver3"}
                        mountainous={true}
                        caution={true}
                        isreviewed={isreviewed}
                        setIsReviewed={setIsReviewed}
                    ></HistoryList>
                    <HistoryList stopOver1={""}></HistoryList>
                    <HistoryList></HistoryList>
                </Grid>
            </Grid>
        </Layout>

    )
}

export default History;