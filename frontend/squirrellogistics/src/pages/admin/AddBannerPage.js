import { useTheme } from "@emotion/react";
import { Box, Checkbox, Grid, Pagination, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";
import BannerThumbnail from "../../components/admin/Banner/BannerThumbnail";
import { CommonSmallerTitle, CommonSubTitle, CommonTitle } from "../../components/common/CommonText";
import PushPinIcon from '@mui/icons-material/PushPin';

import { useCallback, useEffect, useState } from "react";
import { ButtonContainer, One100ButtonAtCenter, OneButtonAtRight } from "../../components/common/CommonButton";
import CommonList from "../../components/common/CommonList";
import { fetchNotices } from "../../api/notice/noticeAPI";
import NoticeList from "../../components/notice/NoticeList";
import { createBanner, getOneBanner, modifyBanner } from "../../api/admin/bannerApi";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const AddBannerPage = () => {

    const thisTheme = useTheme();
    const [params] = useSearchParams();
    const id = params.get("id");
    const navigate = useNavigate();
    const [bannerForm, setBannerForm] = useState({
        title: "",
        subTitle: "",
        img: "",
        noticeId: 0
    });
    const [selectedNotice, setSelectedNotice] = useState({
        id: null,
        title: null
    }); // 하나만 선택

    const [notices, setNotices] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [inputKeyword, setInputKeyword] = useState(""); // 인풋용 임시 state
    const [keyword, setKeyword] = useState(""); // 실제 검색어
    const [loading, setLoading] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        if (!id) return;
        if (!notices) return;
        const accessToken = localStorage.getItem('accessToken');
        getOneBanner({ accessToken, bannerId: id })
            .then(res => {
                console.log(res.data);
                setBannerForm({
                    title: res.data.title,
                    subTitle: res.data.subTitle,
                    img: res.data.imageUrl,     // 프론트에서는 img로 사용
                    noticeId: res.data.noticeId
                });
                const target = notices.find(n => n.noticeId === res.data.noticeId);
                console.log(target);
                if (target) {
                    handleCheckboxChange(target);
                };
            })
            .catch(err => {
            })
        // .finally(() => setLoading(false));
    }, [notices])

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

    const handleCheckboxChange = (notice) => {
        setSelectedNotice({ id: notice.noticeId, title: notice.title });
        setBannerForm((p) => ({ ...p, noticeId: notice.noticeId }));
    }

    const saveNotice = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (bannerForm.title === null || bannerForm.title.length === 0) {
            alert('제목이 입력되지 않았습니다.');
            return;
        }
        if (bannerForm.subTitle === null || bannerForm.subTitle.length === 0) {
            alert('부제목이 입력되지 않았습니다.');
            return;
        }
        if (bannerForm.img === null || bannerForm.img.length === 0) {
            alert('사진이 등록되지 않았습니다.');
            return;
        }
        if (bannerForm.noticeId === 0) {
            alert('공지가 연결되지 않았습니다.');
            return;
        }

        const formData = new FormData();
        if (bannerForm.img instanceof File) {//파일이면 formData에 넣기
            formData.append("imageFile", bannerForm.img);
        }
        formData.append("title", bannerForm.title);
        formData.append("subTitle", bannerForm.subTitle);
        formData.append("noticeId", bannerForm.noticeId);

        if (id) {
            formData.append("bannerId", id);
            modifyBanner({ accessToken, formData })
                .then(() => {
                    window.location.href = "/admin/banner";
                });
        } else {
            createBanner({ accessToken, formData })
                .then(() => {
                    window.location.href = "/admin/banner";
                });
        }


    }

    const searchNotice = () => {
        console.log(inputKeyword);
        setKeyword(inputKeyword);
        setPage(0);
    };

    return (
        <>
            <CommonTitle>배너 {id ? "수정" : "추가"}</CommonTitle>
            <Grid container spacing={3} marginBottom={10}>
                <Grid size={2} />
                <Grid size={8}>
                    <CommonSmallerTitle>* 배너 미리보기</CommonSmallerTitle>
                    {id ?
                        <BannerThumbnail
                            adding={true}
                            bannerForm={bannerForm}
                            setBannerForm={setBannerForm}
                            selectedNotice={selectedNotice}
                            src={bannerForm.img}
                            id={id}
                        />
                        :
                        <BannerThumbnail
                            adding={true}
                            bannerForm={bannerForm}
                            setBannerForm={setBannerForm}
                            selectedNotice={selectedNotice}
                        />
                    }
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
                    <Grid container spacing={3} marginBottom={3}>
                        <Grid size={10}>
                            <TextField
                                fullWidth
                                value={selectedNotice?.title || ""}
                                placeholder="공지사항을 연결해주세요."
                                disabled
                            />
                        </Grid>
                        <Grid size={2}>
                            <One100ButtonAtCenter height={"100%"} clickEvent={saveNotice}>
                                저&nbsp;&nbsp;&nbsp;장
                            </One100ButtonAtCenter>
                        </Grid>
                    </Grid>

                    <CommonList padding={2} sx={{ minHeight: '30vh' }}>
                        <Grid container spacing={3}>
                            <Grid size={10}>
                                <TextField
                                    placeholder="공지 제목으로 검색하기"
                                    fullWidth
                                    onChange={(event) => setInputKeyword(event.target.value)}
                                />
                            </Grid>
                            <Grid size={2}>
                                <One100ButtonAtCenter height={"100%"} clickEvent={searchNotice}>
                                    검&nbsp;&nbsp;&nbsp;색
                                </One100ButtonAtCenter>
                            </Grid>
                            <Grid size={12}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: "10%", textAlign: "center" }}>고정</TableCell>
                                            <TableCell sx={{ width: "50%", textAlign: "center" }}>제목</TableCell>
                                            <TableCell sx={{ width: "20%", textAlign: "center" }}>등록일</TableCell>
                                            <TableCell sx={{ width: "20%", textAlign: "center" }}></TableCell>
                                            <TableCell sx={{ width: "10%", textAlign: "center" }}>연결</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {notices?.map((notice) => {
                                            return (<TableRow key={notice.noticeId}>
                                                <TableCell sx={{ width: "10%", textAlign: "center", whiteSpace: 'pre-line', padding: 0 }}>
                                                    {notice.pinned ?
                                                        <PushPinIcon sx={{ color: thisTheme.palette.primary.main }} /> : ''}
                                                </TableCell>
                                                <TableCell sx={{ width: "50%", textAlign: "center", whiteSpace: 'pre-line' }}>
                                                    {notice.title}
                                                </TableCell>
                                                <TableCell sx={{ width: "20%", textAlign: "center" }}>
                                                    {notice.createdAt}
                                                </TableCell>
                                                <TableCell sx={{ width: "20%", textAlign: "center" }}>
                                                    {notice.createdAt}
                                                </TableCell>
                                                <TableCell sx={{ width: "10%", textAlign: "center" }}>
                                                    <Checkbox
                                                        checked={selectedNotice?.id === notice.noticeId}
                                                        onChange={() => handleCheckboxChange(notice)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

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
                <Grid size={2} />
            </Grid>
        </>
    )
}
export default AddBannerPage;