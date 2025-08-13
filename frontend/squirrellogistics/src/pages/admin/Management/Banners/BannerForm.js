// src/pages/admin/Management/Banners/BannerForm.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { createBanner, getBanner, updateBanner } from "../../../../api/banner";

const PALETTE = {
  blue: "#113F67",
  gold: "#E8A93F",
  grayBg: "#F5F7FA",
  text: "#2A2A2A",
};

const POSITIONS = [
  { label: "홈 상단", value: "홈 상단" },
  { label: "홈 중단", value: "홈 중단" },
  { label: "홈 하단", value: "홈 하단" },
];

const STATUS = [
  { label: "노출", value: "ACTIVE" },
  { label: "비노출", value: "INACTIVE" },
];

export default function BannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    position: "홈 상단",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    status: "ACTIVE",
    order: 1,
    linkUrl: "",
    imageUrl: "",
    memo: "",
  });
  const [preview, setPreview] = useState("");

  useEffect(() => {
    (async () => {
      if (!isEdit) return;
      const data = await getBanner(id);
      if (data) {
        setForm({
          title: data.title || "",
          position: data.position || "홈 상단",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          status: data.status || "ACTIVE",
          order: data.order ?? 1,
          linkUrl: data.linkUrl || "",
          imageUrl: data.imageUrl || "",
          memo: data.memo || "",
        });
        setPreview(data.imageUrl || "");
      }
    })();
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 간단 미리보기 URL
    const url = URL.createObjectURL(file);
    setPreview(url);
    // 실제 배포 시에는 업로드 후 받은 이미지 URL을 imageUrl에 저장하도록 변경
    setForm((f) => ({ ...f, imageUrl: url }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return alert("제목을 입력해 주세요.");
    if (!form.imageUrl) return alert("이미지를 업로드해 주세요.");
    if (new Date(form.endDate) < new Date(form.startDate)) {
      return alert("종료일은 시작일 이후여야 합니다.");
    }
    if (isEdit) {
      await updateBanner(id, form);
      alert("수정되었습니다.");
    } else {
      await createBanner(form);
      alert("등록되었습니다.");
    }
    navigate("/admin/management/banners");
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ color: PALETTE.blue, fontWeight: 700, mb: 2 }}>
        {isEdit ? "배너 수정" : "배너 등록"}
      </Typography>

      <Paper component="form" onSubmit={onSubmit} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="제목 *"
              name="title"
              value={form.title}
              onChange={onChange}
              fullWidth
            />
            <TextField
              select
              label="위치 *"
              name="position"
              value={form.position}
              onChange={onChange}
              sx={{ minWidth: 160 }}
            >
              {POSITIONS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="상태 *"
              name="status"
              value={form.status}
              onChange={onChange}
              sx={{ minWidth: 160 }}
            >
              {STATUS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="노출 순서"
              name="order"
              type="number"
              value={form.order}
              onChange={onChange}
              sx={{ width: 140 }}
              inputProps={{ min: 1 }}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="시작일 *"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="종료일 *"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="링크 URL"
              name="linkUrl"
              value={form.linkUrl}
              onChange={onChange}
              fullWidth
              placeholder="배너 클릭 시 이동할 주소 (선택)"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
            <Button
              variant="outlined"
              onClick={() => fileRef.current?.click()}
              sx={{ borderColor: PALETTE.blue, color: PALETTE.blue }}
            >
              이미지 업로드
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFile}
            />
            {preview && (
              <img
                src={preview}
                alt="미리보기"
                style={{
                  width: 360,
                  height: 144,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: `2px solid ${PALETTE.grayBg}`,
                }}
              />
            )}
          </Stack>

          <TextField
            label="메모"
            name="memo"
            value={form.memo}
            onChange={onChange}
            multiline
            minRows={3}
            placeholder="내부 참고용 메모"
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/management/banners")}
              sx={{ borderColor: PALETTE.blue, color: PALETTE.blue }}
            >
              목록
            </Button>
            <Button type="submit" variant="contained" sx={{ background: PALETTE.blue }}>
              {isEdit ? "수정" : "등록"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
