import { Box, Divider, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material"
import { useState } from "react"

export const RefundDate = ({refundDate, setRefundDate}) => {
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
        const refundOption = [
            { value: "3", label: "3일" },
            { value: "5", label: "5일" },
            { value: "7", label: "7일" },
        ];

        return (
            <FormControl>
                <Box
                //#region [나중에 다시 볼 곳]
                    width="200%"
                    fontSize="20px"
                    color="#2A2A2A"
                    display='flex'
                    flexWrap={'wrap'}
                    justifyContent={'space-evenly'}

                >
                    {refundOption.map((item) => (
                            <FormControlLabel
                                key={item.value}
                                value={item.value}
                                control={
                                    <Radio
                                        checked={refundDate === item.value}
                                        onChange={(e) => setRefundDate(e.target.value)}
                                        value={item.value}
                                        name="refund-date"
                                    />
                                }
                                label={item.label}
                                // labelPlacement="end"
                                sx={{ margin: "2%" }}
                            />
                    ))}
                </Box>
            </FormControl>
        );
    }

    return (
        <Box
            sx={{
                width: "100%",
                border: 1,
                borderColor: "#2A2A2A",
                borderRadius: "5px",
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
                    height: "0.5px"
                }}
            />
            <RefundCaution />
        </Box>
    );
}