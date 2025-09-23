import React, { useEffect, useState } from "react";
import { CommonTitle } from "../../components/common/CommonText";
import NoticeEditor from "../../components/notice/NoticeEditor";
import { createNotice, fetchNotice, updateNotice } from "../../api/notice/noticeAPI";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import OneButtonPopupComponent from "../../components/deliveryRequest/OneButtonPopupComponent";
import { Box } from "@mui/material";
import LoadingComponent from "../../components/common/LoadingComponent";

export default function NoticeWritePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const mode = id ? "edit" : "create";
    const [initial, setInitial] = useState(mode === "edit" ? null : { title: "", content: "", pinned: false });
    const [loading, setLoading] = useState(mode === "edit");
    const [submitting, setSubmitting] = useState(false);

    const [errOpen, setErrOpen] = useState(false);
    const [errTitle, setErrTitle] = useState("");
    const [errContent, setErrContent] = useState("");

    useEffect(() => {
        let alive = true;
        if (mode === "edit") {
            (async () => {
                try {
                    setLoading(true);
                    const res = await fetchNotice(Number(id), false); // 조회수 증가 X
                    if (alive) setInitial({ title: res.title, content: res.content, pinned: res.pinned });
                } catch (e) {
                    if (!alive) return;
                    setErrTitle("안내");
                    setErrContent("공지 정보를 불러오지 못했습니다.");
                    setErrOpen(true);
                } finally {
                    if (alive) setLoading(false);
                }
            })();
        }
        return () => { alive = false; };
    }, [mode, id]);

    const handleSubmit = async (payload) => {
        try {
            setSubmitting(true);
            if (mode === "edit") {
                await updateNotice(Number(id), payload);
                navigate(`/admin/notice/read/${id}`);
            } else {
                const newId = await createNotice(payload);
                navigate(`/admin/notice/read/${newId}`);
            }
        } catch (e) {
            setErrTitle("안내");
            setErrContent(mode === "edit" ? "수정에 실패했습니다." : "등록에 실패했습니다.");
            setErrOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <CommonTitle>{mode === "edit" ? "공지사항 수정" : "새 공지 작성"}</CommonTitle>

            {!loading && initial && (
                <NoticeEditor
                    mode={mode}
                    initial={initial}
                    onSubmit={handleSubmit}
                    onBack={() => navigate("/admin/notice/list")}
                    submitting={submitting}
                />
            )}

            <OneButtonPopupComponent
                open={errOpen}
                title={errTitle}
                content={errContent}
                onClick={() => setErrOpen(false)}
            />
            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
                    <LoadingComponent
                        open={loading}
                        text="공지를 불러오는 중..." />
                </Box>
            )}
        </>
    );

}