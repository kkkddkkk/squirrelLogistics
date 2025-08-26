import {
    Typography, Button, Box, Grid, Paper, Select, MenuItem,
    TextField, InputLabel, FormControl, Pagination, Divider,
    Snackbar,
    Alert,
    IconButton
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close"

import DeliveryCard from './DeliveryCard';
import { fetchDeliveryRequests } from '../../api/deliveryRequest/deliveryRequestAPI';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { fetchDeliveryProposals } from '../../api/deliveryRequest/deliveryProposalAPI';
import { useParams } from 'react-router-dom';
import DriverProposalComponent from './DriverProposalComponent';
import LoadingComponent from '../common/LoadingComponent';

const ListComponent = () => {

    const { driverId } = useParams();

    const [pageData, setPageData] = useState(null);
    const [pageReq, setPageReq] = useState({ page: 1, size: 10, sort: "createAt", dir: "DESC" });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    // proposals (토스트용)
    const [proposals, setProposals] = useState([]);
    const [openToast, setOpenToast] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        setErr(null);
        fetchDeliveryRequests(pageReq)
            .then(setPageData)
            .catch(e => {
                setErr(e?.response?.data || e.message);
            })
            .finally(() => setLoading(false));
    }, [pageReq]);

    // 지명 제안 조회 + 토스트 열기
    useEffect(() => {
        const idNum = Number(driverId);
        if (!driverId || Number.isNaN(idNum)) {
            return;
        }
        const ctrl = new AbortController();
        fetchDeliveryProposals(driverId, { signal: ctrl.signal })
            .then((list) => {
                const arr = Array.isArray(list) ? list : [];
                setProposals(arr);

                if (arr.length > 0) {
                    setOpenToast(true);
                }
            })
            .catch();

        return () => ctrl.abort();
    }, [driverId]);

    if (loading && !pageData) {
        return <LoadingComponent open text="요청 목록을 불러오는 중..." />;
    }
    if (err) return <div>에러: {String(err)}</div>;
    if (!pageData) return null;

    const { dtoList, pageNumList, current, prev, next, prevPage, nextPage, totalCount, totalPage, pageRequestDTO } = pageData;

    const openProposalDialog = () => {
        setDialogOpen(true);
    };

    const closeProposalDialog = () => {
        setDialogOpen(false);
    };

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

                        {/* 운전자 지명 제안 도착 */}
                        {openToast ?
                            <Paper
                                onClick={openProposalDialog}
                                sx={{
                                    p: 1,
                                    pl: 2,
                                    mb: 2,
                                    border: '1px solid #2a2a2a5d',
                                    boxShadow: '0px 5px 8px rgba(0, 0, 0, 0.1)',
                                    borderRadius: 1.5,
                                    fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif',
                                    bgcolor: '#113F67'
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontFamily: 'Spoqa Han Sans Neo, Montserrat, sans-serif',
                                        color: '#e3effcff',
                                        fontSize: 'clamp(12px, 1.5vw, 14px)',
                                    }}
                                >
                                    <Box component="span" sx={{ color: '#ff2121ff', fontWeight: 700, mr: 1 }}>
                                        [알림]
                                    </Box>{' '}
                                    기사님께 지명 운송 요청이 {proposals.length}건 도착하였습니다!

                                    <Box component="span" sx={{ ml: 1, color: '#e3effcff', fontWeight: 700 }}>
                                        (클릭하여 확인하기)
                                    </Box>{' '}
                                </Typography>
                            </Paper>
                            : <></>}
                        {dtoList.map((item, idx) => (
                            <DeliveryCard key={item.requestId} item={item} />
                        ))}

                        <Box display="flex" justifyContent="center" mt={4}>
                            <Pagination
                                page={current}               // 1-based라 그대로 OK
                                count={totalPage}            // 전체 페이지 수
                                onChange={(_, value) => {
                                    if (value !== pageReq.page) {
                                        setPageReq(prev => ({ ...prev, page: value }));
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }
                                }}
                                shape="rounded"
                                showFirstButton
                                showLastButton
                                siblingCount={1}
                                boundaryCount={1}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            {dialogOpen && (
                <DriverProposalComponent
                    open={dialogOpen}
                    proposals={proposals}
                    onClose={closeProposalDialog}
                />
            )}
            {loading && (
                <LoadingComponent open={loading} text="요청 목록을 불러오는 중..." />
            )}
        </Box>
    );
};

export default ListComponent;