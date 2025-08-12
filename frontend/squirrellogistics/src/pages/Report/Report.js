import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField } from "@mui/material";
import { Layout, OneBigBtn, SubTitle } from "../../components/common/CommonForCompany";
import { useEffect, useState } from "react";
import ReportImg from "../../components/report/ReportImg";
import useCompanyMove from "../../hook/company/useCompanyMove";


const Report = () => {

    const [cateValue, setCateValue] = useState("");
    const [preview1, setPreview1] = useState(false);
    const [preview2, setPreview2] = useState(false);
    const [preview3, setPreview3] = useState(false);
    const [preview4, setPreview4] = useState(false);
    const [preview5, setPreview5] = useState(false);

    const previewCount = [preview1, preview2, preview3, preview4, preview5].filter(Boolean).length;

    const {moveToReportList} = useCompanyMove();
    const handleReport=()=>{
        // eslint-disable-next-line no-restricted-globals
        if(confirm('신고를 등록하시겠습니까?')){
            console.log('신고됨')
            moveToReportList();
        }
    }

    return (
        <Layout title={"신고"}>
            <Grid container display={"flex"} justifyContent={"center"} minWidth={"1000px"}>
                <Grid size={3} />
                <Grid size={6}>
                    <FormControl fullWidth>
                        <Box marginBottom={"5%"}>
                            <SubTitle>제목</SubTitle>
                            <TextField fullWidth></TextField>
                        </Box>
                        <Box marginBottom={"5%"}>
                            <SubTitle>내용</SubTitle>
                            <TextField fullWidth multiline rows={10}></TextField>
                        </Box>

                        <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            name="radio-buttons-group"
                            row
                            value={cateValue}
                            onChange={e => setCateValue(e.target.value)}
                        >
                            <FormControlLabel value="a" control={<Radio />} label="물품 파손/분실" />
                            <FormControlLabel value="b" control={<Radio />} label="서비스" />
                            <FormControlLabel value="c" control={<Radio />} label="경로 이탈" />
                            <FormControlLabel value="d" control={<Radio />} label="Other" />
                            {/* <FormControlLabel value="e" control={<Radio />} label="Other" /> */}
                            <FormControlLabel value="ETC" control={<Radio />} label="기타" />
                        </RadioGroup>
                        {cateValue == "ETC" ? <TextField fullWidth></TextField> : <></>}

                        <Box margin={"5% 0"}>
                            <SubTitle>사진(n/5)</SubTitle>
                            <Grid size={12} display={"flex"}>
                                <ReportImg addPic={true} preview={preview1} setPreview={setPreview1} />
                                {previewCount >= 1 ? <ReportImg addPic={true} preview={preview2} setPreview={setPreview2} /> : <></>}
                                {previewCount >= 2 ? <ReportImg addPic={true} preview={preview3} setPreview={setPreview3} /> : <></>}
                                {previewCount >= 3 ? <ReportImg addPic={true} preview={preview4} setPreview={setPreview4} /> : <></>}
                                {previewCount >= 4 ? <ReportImg addPic={true} preview={preview5} setPreview={setPreview5} /> : <></>}
                            </Grid>
                        </Box>
                    </FormControl>
                    <OneBigBtn func={handleReport}>등&nbsp;&nbsp;&nbsp;록</OneBigBtn>
                </Grid>

                <Grid size={3} />
            </Grid>
        </Layout>
    )
}
export default Report;