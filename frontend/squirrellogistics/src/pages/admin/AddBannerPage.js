import { useTheme } from "@emotion/react";
import { Box, Grid, Pagination, TextField } from "@mui/material";
import BannerThumbnail from "../../components/admin/Banner/BannerThumbnail";
import { CommonSmallerTitle, CommonSubTitle, CommonTitle } from "../../components/common/CommonText";

import { useCallback, useEffect, useState } from "react";
import { ButtonContainer, One100ButtonAtCenter, OneButtonAtRight } from "../../components/common/CommonButton";
import CommonList from "../../components/common/CommonList";
import { fetchNotices } from "../../api/notice/noticeAPI";
import NoticeList from "../../components/notice/NoticeList";

const AddBannerPage = () => {

    const [bannerForm, setBannerForm] = useState({
        title: "",
        subTitle: "",
        img: "",
    });

    const [notices, setNotices] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const pageSize = 10;


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
            console.log(res);
        } catch (e) {
            // handleApiError(e, "공지 목록을 불러오지 못했습니다.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, keyword]);

    useEffect(() => {
        const ctrl = new AbortController();
        loadNotices(ctrl.signal);
        return () => ctrl.abort();
    }, [loadNotices]);

    const onChange = (key) => (e) => {
        const v = e.target.value;
        setBannerForm((p) => ({ ...p, [key]: v }));
    };

    const searchNotice = () => {

    }

    return (
        <>
            <CommonTitle>배너 추가</CommonTitle>
            <Grid container spacing={3} marginBottom={10}>
                <Grid size={3} />
                <Grid size={6}>
                    <CommonSmallerTitle>* 배너 미리보기</CommonSmallerTitle>
                    <BannerThumbnail
                        adding={true}
                        bannerForm={bannerForm}
                        setBannerForm={setBannerForm}
                    />
                    <TextField
                        label={`제목(${bannerForm.title.length}/50)`}
                        inputProps={{ maxLength: 50 }}
                        fullWidth
                        sx={{ marginBottom: 3 }}
                        value={bannerForm.title}
                        onChange={onChange("title")}
                    />
                    <TextField
                        label={`부제목(${bannerForm.subTitle.length}/50)`}
                        inputProps={{ maxLength: 50 }}
                        fullWidth
                        sx={{ marginBottom: 3 }}
                        value={bannerForm.subTitle}
                        onChange={onChange("subTitle")}
                    />
                    <CommonList padding={2} sx={{ height: '30vh' }}>
                        <Grid container spacing={3}>
                            <Grid size={10}>
                                <TextField
                                    placeholder="공지 제목으로 검색하기"
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={2}>
                                <One100ButtonAtCenter height={"100%"} clickEvent={searchNotice}>
                                    검&nbsp;&nbsp;&nbsp;색
                                </One100ButtonAtCenter>
                            </Grid>
                            <Grid size={12}>
                                <NoticeList
                                    notices={notices}
                                    isAdmin={false}
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
                        </Grid>
                    </CommonList>
                </Grid>
                <Grid size={3} />
            </Grid>
        </>
    )
}
export default AddBannerPage;