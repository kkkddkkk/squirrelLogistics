import { Box, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField } from "@mui/material";
import { Layout, SubTitle } from "../../components/common/CommonForCompany";


const Report = () => {
    return (
        <Layout title={"신고"}>
            <Grid container display={"flex"} justifyContent={"center"}>
                <Grid size={3} />
                <Grid size={6}>
                    <Box marginBottom={"5%"}>
                        <SubTitle>제목</SubTitle>
                        <TextField fullWidth></TextField>
                    </Box>
                    <Box marginBottom={"5%"}>
                        <SubTitle>내용</SubTitle>
                        <TextField fullWidth multiline rows={10}></TextField>
                    </Box>
                    <FormControl>
                        <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            name="radio-buttons-group"
                            row
                        >
                            <FormControlLabel value="female" control={<Radio />} label="Female" />
                            <FormControlLabel value="male" control={<Radio />} label="Male" />
                            <FormControlLabel value="other" control={<Radio />} label="Other" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid size={3} />
            </Grid>
        </Layout>
    )
}
export default Report;