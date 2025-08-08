import { Box, Divider, FormControl, FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@mui/material"
import { useState } from "react"

export const RefundDate = ({ refundDate, setRefundDate }) => {
    function RefundCaution() {
        return (
            <Grid size={12} display={"flex"} justifyContent={"center"} alignItems={"center"} margin={"2%"}>
                <Typography sx={{ color: "#A20025" }}>
                    {refundDate}일 이내 매칭 실패 시 결제를 취소합니다.
                </Typography>
            </Grid>

        )
    }

    function RefundRadioForm() {
        const refundOption = [
            { value: "3", label: "3일" },
            { value: "5", label: "5일" },
            { value: "7", label: "7일" },
        ];

        return (
            <FormControl>
                <Box
                    width="100%"
                    display='flex'
                    flexWrap={'wrap'}
                    justifyContent={'space-around'}
                    margin={"2%"}
                >

                    {refundOption.map((item) => (
                        <Box>
                            <FormControlLabel
                                key={item.value}
                                value={item.value}
                                control={
                                    <Radio
                                        checked={refundDate === item.value}
                                        onChange={(e) => setRefundDate(e.target.value)}
                                        value={item.value}
                                        name="refund_date"
                                    />
                                }
                                label={item.label}
                            />
                        </Box>
                    ))}


                </Box>
            </FormControl>
        );
    }

    return (

        <Grid container sx={{ border: "1px solid #2A2A2A", marginBottom: "5%" }}>
            <RefundRadioForm></RefundRadioForm>
            <Divider
                orientation="horizontal"
                flexItem
                sx={{
                    backgroundColor: "#909095",
                    height: "0.5px"
                }}
            />
            <RefundCaution />
        </Grid>
    );
}