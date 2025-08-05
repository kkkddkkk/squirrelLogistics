import { Box, Divider, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material"
import { useState } from "react"

export const RefundDate = () => {
    const [refundDate, setRefundDate] = useState('3');
    const [selectedValue, setSelectedValue] = useState('3');

    function RefundCaution() {

        return (
            <Box
                width={"100%"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                margin={"2%"}
            >
                <Typography sx={{ color: "#A20025" }}>
                    {refundDate}일 이내 매칭 실패 시 결제를 취소합니다.
                </Typography>
            </Box>

        )
    }

    function RefundRadioForm() {
        function RefundRadio(props) {
            return (
                <Radio
                    {...props}
                    sx={{ color: "#113F67" }}
                    size="small"
                />
            )
        }

        function changeRefundDate(e) {
            setRefundDate(e.target.value);
            setSelectedValue(e.target.value);
        }

        return (
            <FormControl>
                <RadioGroup
                    row
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="3"
                    name="radio-buttons-group"
                    value={selectedValue}
                    sx={{
                        color: "#2A2A2A",
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-evenly",
                        fontSize: "20px",
                        alignItems: "center",
                        margin: "2%"
                    }}
                    onChange={changeRefundDate}
                >
                    {[{ value: "3", label: "3일" }, { value: "5", label: "5일" }, { value: "7", label: "7일" }].map(item => (
                        <Box key={item.value} sx={{ flex: 1, textAlign: "center" }}>
                            <FormControlLabel
                                key={item.value}
                                value={item.value}
                                control={<RefundRadio />}
                                label={item.label}
                                sx={{
                                    margin: 0,
                                    textAlign: "center",
                                }}
                            />
                        </Box>
                    ))}
                </RadioGroup>
            </FormControl>
        )
    }

    return (
        <Box
            sx={{
                width: "100%",
                border: 1,
                borderColor: "#2A2A2A",
                borderRadius: "5px",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                marginBottom: "10%",
            }}
        >

            <RefundRadioForm></RefundRadioForm>
            <Divider
                orientation="horizontal"
                flexItem
                sx={{
                    backgroundColor: "#909095",
                    height: "2px"
                }}
            />
            <RefundCaution />
        </Box>
    );
}