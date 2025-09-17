import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { CommonTitle } from "../../components/common/CommonText";
import NoticeDetail from "../../components/notice/NoticeDetail";
import OneButtonPopupComponent from "../../components/deliveryRequest/OneButtonPopupComponent";
import { fetchNotice } from "../../api/notice/noticeAPI";

export default function NoticeReadPage({ isAdmin }) {
  const { id } = useParams(); // 라우트: /notices/:id 또는 /admin/notice/:id
  const navigate = useNavigate();

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
          openErrorPopup({ title: "세션 만료", content: "로그인이 필요합니다.", redirectPath: "/login" });
        } else {
          openErrorPopup({ title: "안내", content: "공지 정보를 불러오지 못했습니다." });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const handleBack = () => {
    // 목록 경로는 프로젝트 라우팅에 맞게 조정
    navigate(isAdmin ? "/admin/notice/list" : "/notices");
  };

  const handleEdit = () => {
    // 수정 페이지 경로는 프로젝트 라우팅에 맞게 조정
    navigate(`/admin/notice/edit/${id}`);
  };

  return (
    <>
      <CommonTitle>공지사항</CommonTitle>

      <Grid container justifyContent="center" marginBottom={5} minHeight="50vh">
        <Grid size={3} />
        <Grid size={6}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
              <CircularProgress />
            </Box>
          ) : data ? (
            <NoticeDetail
              data={data}
              isAdmin={!!isAdmin}
              onBack={handleBack}
              onEdit={handleEdit}
            />
          ) : null}
        </Grid>
        <Grid size={3} />
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
    </>
  );
}