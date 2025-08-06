import {
    Typography, Button, Box, Grid, Paper, Select, MenuItem,
    TextField, InputLabel, FormControl, Pagination, Divider
} from '@mui/material';

import DeliveryCard from './DeliveryCard';

const dataDTOs = Array(7).fill({
    request_id: 2025072500123,
    company_id: 177,
    company_name:"(주) 광진물산",
    estimated_fee: 98000,
    created_at: new Date(new Date() - 15 * 60 * 1000), // 15분 전
    start_address: "서울특별시 강남구 테헤란로 212",
    end_address: "경기 하남시 위례대로 200",
    distance: 47,
    duration: 214,
    waypoints: [
        { address: "서울특별시 중구 세종대로 110", order: 1, handling_id: 1 },
        { address: "서울특별시 용산구 이태원로 177", order: 2, handling_id: 2 },
        { address: "서울특별시 마포구 월드컵북로 396", order: 3, handling_id: 3 },
    ]
});
const ListComponent = () => {
    return (
        <Box width={"100%"}>
            <Box width={"100%"}>
                <Grid
                    sx={{
                        background: "linear-gradient(to bottom, #58a1c85d 0%, white 100%)",
                    }}
                >
                    <Typography variant="h4" align="center" pt={4} gutterBottom
                        sx={{
                            fontFamily: 'inherit', fontSize: '2.0rem',
                            fontWeight: 'bold',
                            color: '#2A2A2A',
                            margin: 0
                        }}>배송 요청</Typography>

                    <Grid container spacing={10} justifyContent="center" width={"100%"} p={4}>
                        <Grid item width={"20%"} >
                            <FormControl fullWidth
                                sx={{
                                    fontFamily: 'inherit',
                                    fontWeight: 'bold',
                                    color: '#2A2A2A',
                                    bgcolor: 'white',
                                    borderRadius: 1.2,
                                }}>
                                <InputLabel>출발 지역</InputLabel>
                                <Select defaultValue="">
                                    <MenuItem value="">전체</MenuItem>
                                    <MenuItem value="서울">서울</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item width={"60%"}>
                            <TextField fullWidth placeholder="Search" size="medium" p={4}
                                sx={{
                                    fontFamily: 'inherit',
                                    fontWeight: 'bold',
                                    color: '#2A2A2A',
                                    bgcolor: 'white',
                                    borderRadius: 1.2,
                                }}></TextField>
                        </Grid>
                    </Grid>

                </Grid>

                {/* 필터 및 검색 */}
                <Grid container width={"100%"} p={4} pt={0} spacing={10} justifyContent={"center"}>
                    {/* 좌측 필터 영역 */}
                    <Grid item width={"20%"}>
                        <Typography variant="subtitle1" fontWeight="bold">검색 필터</Typography>
                        <Button size="small">초기화</Button>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>시작 위치</InputLabel>
                            <Select defaultValue="서울 특별시">
                                <MenuItem value="서울 특별시">서울 특별시</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>종료 위치</InputLabel>
                            <Select defaultValue="서울 특별시">
                                <MenuItem value="서울 특별시">서울 특별시</MenuItem>
                            </Select>
                        </FormControl>

                        <Box display="flex" gap={1} mt={2}>
                            <TextField label="경유지 수 (최소)" type="number" fullWidth size="small" />
                            <TextField label="최대" type="number" fullWidth size="small" />
                        </Box>

                        <Box display="flex" gap={1} mt={2}>
                            <TextField label="수익 (최소)" type="number" fullWidth size="small" />
                            <TextField label="최대" type="number" fullWidth size="small" />
                        </Box>

                        <Button variant="outlined" fullWidth sx={{ mt: 2 }}>적용하기</Button>
                    </Grid>

                    {/* 리스트 영역 */}
                    <Grid item width={"60%"}>
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    defaultValue="최신 등록 순"
                                    disableUnderline
                                    sx={{
                                        color: '#2A2A2A',
                                        fontWeight: 'bold',
                                        fontSize: '0.95rem',
                                        '& .MuiSelect-icon': { color: '#2A2A2A' },
                                    }}
                                >
                                    <MenuItem value="최신 등록 순">최신 등록 순</MenuItem>
                                    <MenuItem value="수익 높은 순">수익 높은 순</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {dataDTOs.map((item, idx) => (
                            <DeliveryCard key={idx} item={item} />
                        ))}

                        <Box display="flex" justifyContent="center" mt={4}>
                            <Pagination count={3} shape="rounded" />
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ListComponent;