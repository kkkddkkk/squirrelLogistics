import { FormControlLabel, Radio, RadioGroup, TextField } from "@mui/material";

const ReportRadio = ({ cateValue, setCateValue, reporter }) => {

    return (
        <>
            <RadioGroup
                aria-labelledby="rCate-label"
                name="rCate"
                row
                value={cateValue}
                onChange={(e) => setCateValue(e.target.value)}
            >
                {reporter === "COMPANY" ?
                    <>
                        <FormControlLabel value={"SERVICE"} control={<Radio />} label={"서비스"} />
                        <FormControlLabel value={"VEEROFCOURSE"} control={<Radio />} label={"경로이탈"} />
                        <FormControlLabel value={"DAMAGE"} control={<Radio />} label={"물품파손"} />
                    </>
                    :
                    <>
                        <FormControlLabel value={"REVIEW"} control={<Radio />} label={"부적절한 리뷰"} />
                        <FormControlLabel value={"INAPPROPRIATE"} control={<Radio />} label={"부적절한 운송요청"} />
                    </>
                }
                <FormControlLabel value={"ETC"} control={<Radio />} label={"ETC"} />
            </RadioGroup>

            {cateValue === "ETC" ? <TextField fullWidth /> : <></>}
        </>

    )
}

export default ReportRadio;