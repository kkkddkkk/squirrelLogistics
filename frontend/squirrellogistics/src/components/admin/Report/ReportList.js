import { Box, Grid, Pagination, Table, TableBody, TableCell, TableHead, TableRow, TextField, useMediaQuery, useTheme } from "@mui/material";
import CommonList from "../../common/CommonList";
import { One100ButtonAtCenter, OneButtonAtRight } from "../../common/CommonButton";
import usePaymentMove from "../../../hook/paymentHook/usePaymentMove";
import { useEffect, useState } from "react";
import { getReportlist, setReportInReview } from "../../../api/admin/reportApi";
import { switchCate, switchStatusForList } from "./reportEnum";
import { useNavigate } from "react-router-dom";

const ReportList = ({ status, cate }) => {
    const thisTheme = useTheme();
    const isMobile = useMediaQuery(thisTheme.breakpoints.down('sm'));
    const { moveToMain } = usePaymentMove();
    const navigate = useNavigate();
    const [data, setData] = useState();
    const [page, setPage] = useState(0);
    const size = 10;
    const [totalPages, setTotalPages] = useState();
    const [inputKeyword, setInputKeyword] = useState(""); // 인풋용 임시 state
    const [keyword, setKeyword] = useState(""); // 실제 검색어

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return moveToMain();
        console.log({ accessToken, page, size, status, cate, keyword });
        getReportlist({ accessToken, page, size, status, cate, keyword })
            .then(res => {
                console.log(res.data.content);
                setData(res.data.content);
                setTotalPages(res.data.totalPages);
            })
            .catch(err => {
            })
        // .finally(() => setLoading(false));
    }, [page, size, keyword, status, cate])

    useEffect(() => {
        console.log(status);
        console.log(cate);
        setPage(0); // keyword2가 바뀌면 페이지도 초기화
    }, [status, cate]);

    const getStatusColor = (data) => {
        let status = switchStatusForList(data);

        switch (status) {
            case '미확인': return thisTheme.palette.error.main;
            case '검토 중': return thisTheme.palette.warning.main;
            case '완료': return thisTheme.palette.success.main
        }
    }

    const viewDetailReport = (reportId) => {
        navigate(`/admin/report/${reportId}`);
    }

    const searchReport = () => {
        console.log(inputKeyword);
        setKeyword(inputKeyword);
        setPage(0);
    }


    return (
        <CommonList padding={3}>
            <Grid container spacing={isMobile?1:3} marginBottom={3}>
                <Grid size={isMobile?9:10}>
                    <TextField
                        placeholder="신고자, 제목으로 검색하기"
                        fullWidth
                        onChange={(event) => setInputKeyword(event.target.value)}
                    />
                </Grid>
                <Grid size={isMobile?3:2}>
                    <One100ButtonAtCenter height={"100%"} clickEvent={searchReport}>
                        검&nbsp;&nbsp;&nbsp;색
                    </One100ButtonAtCenter>
                </Grid>
            </Grid>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: isMobile?"15%":"8%", textAlign: "center" }}>상태</TableCell>
                        {isMobile ? <></> : <>
                            <TableCell sx={{ width: "15%", textAlign: "center" }}>카테고리</TableCell>
                            <TableCell sx={{ width: "15%", textAlign: "center" }}>신고자</TableCell>
                            <TableCell sx={{ width: "15%", textAlign: "center" }}>신고일</TableCell>
                        </>}

                        <TableCell sx={{ width: "32%", textAlign: "center" }}>제목</TableCell>

                        <TableCell sx={{ width: isMobile?"10%":"15%", }}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((report) => (
                        <TableRow key={report.reportId}>
                            <TableCell sx={{ width: isMobile?"15%":"8%", textAlign: "center", whiteSpace: 'pre-line', padding: 0 }}>
                                <Box sx={{
                                    padding: "4px 0",
                                    width: "100%",
                                    border: `1px solid ${getStatusColor(report.status)}`,
                                    color: getStatusColor(report.status),
                                    borderRadius: "5px"
                                }}>
                                    {switchStatusForList(report.status)}
                                </Box>
                            </TableCell>
                            {isMobile?<></>:<>
                                <TableCell sx={{ width: "15%", textAlign: "center", whiteSpace: 'pre-line' }}>
                                    {switchCate(report.cate)}
                                </TableCell>
                                <TableCell sx={{ width: "15%", textAlign: "center" }}>
                                    {report.reporterName}<br />
                                    {report.role != '시스템' ? `${report.role}` : '자동처리'}
                                    {report.role != '시스템' ? ` #${report.reporterId}` : ''}
                                </TableCell>
                                <TableCell sx={{ width: "15%", textAlign: "center" }}>{report.regDate}</TableCell>
                            </>}
                            <TableCell sx={{ width: "32%" }}>{report.title}</TableCell>
                            <TableCell sx={{ width: "15%" }} padding={isMobile?"0":""}>
                                <OneButtonAtRight clickEvent={() => viewDetailReport(report.reportId)}>상세{isMobile?"":"보기"}</OneButtonAtRight>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 5,
                marginBottom: 3
            }}>
                <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={(e, value) => setPage(value - 1)}
                />
            </Box>

        </CommonList>
    )
}
export default ReportList;