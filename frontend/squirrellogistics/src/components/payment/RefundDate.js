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

            <Box
                width="100%"
                display='flex'
                flexWrap={'wrap'}
                justifyContent={'center'}
                margin={"2%"}
            >
                <FormControl>
                    <RadioGroup
                        row   // 가로 배치
                        name="refund_date"
                        value={refundDate}
                        onChange={(e) => setRefundDate(e.target.value)}
                        sx={{
                            justifyContent: "center", // 가운데 정렬
                            gap: 8,                   // 버튼 사이 간격(px, rem 단위 가능)
                        }}
                    >
                        {refundOption.map((item) => (
                            <FormControlLabel
                                key={item.value}
                                value={item.value}
                                control={<Radio />}
                                label={item.label}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>

            </Box>

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