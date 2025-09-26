import React, { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, Grid, useMediaQuery } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { CommonTitle } from "../../components/common/CommonText";
import NoticeDetail from "../../components/notice/NoticeDetail";
import OneButtonPopupComponent from "../../components/deliveryRequest/OneButtonPopupComponent";
import { fetchNotice } from "../../api/notice/noticeAPI";
import LoadingComponent from "../../components/common/LoadingComponent";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Footer from "../Layout/Footer";
import Header from "../Layout/Header";
import { theme } from "../../components/common/CommonTheme";

export default function NoticeReadPage() {
  const { id } = useParams();
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";
  const navigate = useNavigate();
  const isSmaller900 = useMediaQuery(theme.breakpoints.down('md'));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 에러 팝업 상태
  const [errOpen, setErrOpen] = useState(false);
  const [errTitle, setErrTitle] = useState("");
  const [errContent, setErrContent] = useState("");
  const [redirectPath, setRedirectPath] = useState(null);

  const openErrorPopup = ({ title, content, redirectPath }) => {
    setErrTitle(title);
    setErrContent(content);
    setRedirectPath(redirectPath || null);
    setErrOpen(true);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchNotice(Number(id), true); // 조회수 증가
        if (alive) setData(res);
      } catch (err) {
        const status = err?.response?.status ?? null;
        const code = err?.response?.data?.code;

        if (code === "NOTICE_NOT_FOUND" || status === 404) {
          openErrorPopup({ title: "대상 없음", content: "해당 공지를 찾을 수 없습니다.", redirectPath: "/notices" });
        } else if (code === "AUTH_INVALID_TOKEN" || code === "AUTH_EXPIRED_TOKEN" || status === 401) {
          openErrorPopup({ title: "세션 만료", content: "로그인이 필요합니다.", redirectPath: "/" });
        } else {
          console.log(err);
          openErrorPopup({ title: "안내", content: "공지 정보를 불러오지 못했습니다." });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const handleEdit = () => {
    if (isAdmin) {
      navigate(`/admin/notice/edit/${id}`);
    }
  };

  const handleBack = () => {
    if (isAdmin) {
      navigate('/admin/notice/list');
    } else {
      navigate('/notice');
    }
  }
  return (
    <>
      {!isAdmin && (
        <Header />
      )}
      {!isSmaller900 && (
        <CommonTitle>공지사항</CommonTitle>
      )}
      <Grid container justifyContent="center" mt={isSmaller900 ? 2 : 0} marginBottom={5} minHeight="50vh">
        <Grid size={isSmaller900 ? 1 : 2} />
        <Grid size={isSmaller900 ? 10 : 8}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
              <LoadingComponent
                open={loading}
                text="공지를 불러오는 중..." />
            </Box>
          ) : data ? (
            <>
              <Box display="flex" justifyContent="flex-start" mb={2} mt={0}>
                <Chip
                  icon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
                  label="전체 목록 이동"
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleBack}
                  sx={{
                    height: 24,
                    fontSize: 12,
                    fontWeight: 'bold',
                    px: 0.5,
                  }}
                />
              </Box>
              <NoticeDetail
                data={data}
                onEdit={handleEdit}
                isMobile={isSmaller900}
              />
            </>
          ) : null}
        </Grid>
        <Grid size={isSmaller900 ? 1 : 2} />
      </Grid>

      <OneButtonPopupComponent
        open={errOpen}
        title={errTitle || "안내"}
        content={String(errContent)}
        onClick={() => {
          setErrOpen(false);
          const to = redirectPath;
          setRedirectPath(null);
          if (to) navigate(to);
        }}
      />
      {!isAdmin && (
        <Footer />
      )}
    </>
  );
}