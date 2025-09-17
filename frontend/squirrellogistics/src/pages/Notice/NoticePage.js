import React, { useState, useEffect, useCallback } from "react";
import { alpha, Box, Button, Chip, Grid, Pagination, Paper, TextField } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { CommonTitle } from "../../components/common/CommonText";
import NoticeList from "../../components/notice/NoticeList";
import { useNavigate } from "react-router-dom";
import { fetchNotices } from "../../api/notice/noticeAPI";
import OneButtonPopupComponent from "../../components/deliveryRequest/OneButtonPopupComponent";
import LoadingComponent from "../../components/common/LoadingComponent";




const NoticePage = ({ isAdmin }) => {
    const [notices, setNotices] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [query, setQuery] = useState("");
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [errOpen, setErrOpen] = useState(false);
    const [errTitle, setErrTitle] = useState("");
    const [errContent, setErrContent] = useState("");
    const [errKind, setErrKind] = useState(null);
    const [redirectPath, setRedirectPath] = useState(null);

    isAdmin = true;
    const pageSize = 10;

    const openErrorPopup = ({ title, content, kind, redirectPath }) => {
        setErrTitle(title);
        setErrContent(content);
        setErrKind(kind);
        setRedirectPath(redirectPath || null);
        setErrOpen(true);
    };

    const handleApiError = (err, fallbackMsg = "요청 처리 중 오류가 발생했습니다.") => {
        const status = err?.response?.status ?? null;
        const body = err?.response?.data ?? {};
        const code = typeof body?.code === "string" ? body.code : null;
        const msg = body?.message || err?.message || fallbackMsg;

        //인증/세션 관련.
        if (code === "UNAUTHORIZED" || code === "TOKEN_INVALID" || code === "AUTH_EXPIRED_TOKEN" || status === 401) {
            openErrorPopup({
                title: "로그인 필요",
                content: "로그인이 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요.",
                kind: "session",
                redirectPath: "/",
            });
            return;
        }

        //권한 불가.
        if (code === "NOT_ADMIN") {
            openErrorPopup({
                title: "올바르지 않은 접근",
                content: "이 기능에 접근할 권한이 없습니다.",
                kind: "forbidden",
                redirectPath: "/",
            });
            return;
        }

        //리소스 없음.
        if (code === "NOTICE_NOT_FOUND" || status === 404) {
            openErrorPopup({
                title: "대상 없음",
                content: msg || "요청하신 정보를 찾을 수 없습니다.",
                kind: "not_found",
            });
            return;
        }

        //네트워크/서버 에러 등 기타.
        if (!err?.response || status >= 500) {
            openErrorPopup({
                title: "네트워크 오류",
                content: "서버와 통신할 수 없습니다. 네트워크 상태를 확인해 주세요.",
                kind: "info",
            });
            return;
        }

        console.log(err);

        // 5) 기본값
        openErrorPopup({
            title: "안내",
            content: msg,
            kind: "info",
        });
    };

    const loadNotices = useCallback(async (abortSignal) => {
        try {
            setLoading(true);
            const res = await fetchNotices(
                { page, size: pageSize, q: keyword },   // ← query가 아니라 keyword 사용
                { signal: abortSignal }
            );
            const list = (res.dtoList || []).map((dto, idx) => ({
                noticeId: dto.id ?? idx,
                title: dto.title,
                createdAt: dto.createdAt,
                pinned: dto.pinned,
            }));
            setNotices(list);
            setTotalPages(res.totalPage ?? 1);
        } catch (e) {
            handleApiError(e, "공지 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, keyword]);

    useEffect(() => {
        const ctrl = new AbortController();
        loadNotices(ctrl.signal);
        return () => ctrl.abort();
    }, [loadNotices]);

    const handleSearch = () => {
        setPage(1);
        setKeyword(query.trim());
    };

    return (
        <>
            <CommonTitle>{isAdmin ? '공지사항 관리' : '공지사항'}</CommonTitle>
            <Grid container marginBottom={5} justifyContent={"center"} minHeight={"100vh"}>
                <Grid size={3} />
                <Grid size={6}>
                    {isAdmin && (
                        <Box display="flex" justifyContent="flex-start" mb={2} mt={0}>
                            <Chip
                                icon={<AddIcon sx={{ fontSize: 18 }} />}
                                label="새 공지사항 등록"
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() =>
                                    navigate('/admin/notice/publish')
                                }
                                sx={{
                                    height: 24,
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    px: 0.5,
                                }}
                            />
                        </Box>
                    )}

                    <Box display="flex" gap={2} mb={2}>
                        <TextField
                            variant="outlined"
                            placeholder="검색어 입력"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            fullWidth
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        />
                        <Button variant="contained" onClick={handleSearch} sx={{ flex: '0 0 120px' }}>
                            검색
                        </Button>
                    </Box>

                    {/* 진짜 공지 목록 */}
                    <NoticeList
                        notices={notices}
                        isAdmin={!!isAdmin}
                        refresh={() => loadNotices()}
                        loading={loading}
                    />

                    {/* 페이지네이션 */}
                    <Box display="flex" justifyContent="center" mt={3}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                        />
                    </Box>
                </Grid>
                <Grid item size={3} />
            </Grid>
            <OneButtonPopupComponent
                open={errOpen}
                title={errTitle}
                content={
                    <>
                        {String(errContent)}
                        {(errKind === "forbidden" || errKind === "session") ? (
                            <>
                                <br />
                                [확인] 클릭 시, 메인 화면으로 이동합니다.
                            </>
                        ) : (
                            <>
                            </>
                        )}
                    </>
                }
                onClick={() => {
                    setErrOpen(false);
                    const to = redirectPath;
                    setRedirectPath(null);
                    if (to) navigate(to);
                }}
            />
            {loading && (
                <LoadingComponent
                    open={loading}
                    text="공지 목록을 불러오는 중..."
                />
            )}
        </>
    );
};

export default NoticePage;
