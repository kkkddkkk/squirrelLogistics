import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField } from "@mui/material";
import { Layout, SubTitle } from "../../components/common/CommonForCompany";
import { useState } from "react";
import ReportImg from "../../components/report/ReportImg";


const Report = () => {

    const [cateValue, setCateValue] = useState('');
    const [preivew1, setPreview1] = useState('');
    const [preivew2, setPreview2] = useState('');
    const [preivew3, setPreview3] = useState('');
    const [preivew4, setPreview4] = useState('');
    const [preivew5, setPreview5] = useState('');

    return (
        <Layout title={"1:1 문의사항"} >
            <Grid container width={"80%"} maxWidth="1000px" margin="0 auto" display={"flex"} flexWrap={"wrap"}>
                <Grid item size={3} />
                <Grid item size={6}>
                    <FormControl fullWidth >
                        <Box marginBottom={"5%"}>
                            <SubTitle>제목</SubTitle>
                            <TextField fullWidth></TextField>
                        </Box>

                        <Box marginBottom={"5%"}>
                            <SubTitle>내용</SubTitle>
                            <TextField fullWidth multiline rows={10}></TextField>
                        </Box>

                        <RadioGroup
                            aria-labelledby="report-radio-group-label"
                            name="report-radio-group"
                            row
                            value={cateValue}
                            onChange={(e) => setCateValue(e.target.value)}
                        >
                            <FormControlLabel value={"a"} control={<Radio />} label={"Test"} />
                            <FormControlLabel value={"b"} control={<Radio />} label={"Test"} />
                            <FormControlLabel value={"c"} control={<Radio />} label={"Test"} />
                            <FormControlLabel value={"ETC"} control={<Radio />} label={"ETC"} />
                            {cateValue === "ETC" ? <TextField fullWidth /> : <></>}
                        </RadioGroup>

                        <Box margin={"5% 0"}>
                            <SubTitle>사진(n/5)</SubTitle>
                            <Grid container spacing={1} display={"flex"}>
                                {/* <ReportImg addPic={true}></ReportImg> */}
                            </Grid>
                        </Box>
                    </FormControl>
                </Grid>
                <Grid item size={3} />
            </Grid>
        </Layout>
    )
}
export default Report;