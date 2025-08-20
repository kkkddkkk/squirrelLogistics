import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createNotice, getNoticeById, updateNotice } from "./noticeApi";
import { 
  Box, Button, Stack, TextField, Typography, FormControlLabel, Switch, Paper, Alert,
  Divider, Chip
} from "@mui/material";
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Edit as EditIcon, 
  Add as AddIcon,
  PushPin as PinIcon
} from "@mui/icons-material";

export default function NoticeForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", pinned: false });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await getNoticeById(id);
        setForm({ 
          title: data.title ?? "", 
          content: data.content ?? "", 
          pinned: !!data.pinned 
        });
      } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.message || e.message;
        setError(`불러오기 실패 (${status}): ${msg}`);
        setTimeout(() => navigate("/admin/support/notices"), 2000);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === 'pinned' ? checked : value 
    }));
    setError(""); // 에러 메시지 초기화
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!form.content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }
    
    try {
      setLoading(true);
      setError(""); // 에러 메시지 초기화
      
      // 전송할 데이터 로깅
      console.log("전송할 폼 데이터:", form);
      
      if (isEdit) {
        const result = await updateNotice(id, form);
        console.log("공지사항 수정 결과:", result);
      } else {
        const result = await createNotice(form);
        console.log("공지사항 생성 결과:", result);
      }
      
      navigate("/admin/support/notices");
    } catch (e) {
      console.error("공지사항 저장 에러:", e);
      console.error("에러 상세 정보:", {
        message: e.message,
        response: e.response,
        status: e.response?.status,
        data: e.response?.data
      });
      
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e.message || "알 수 없는 오류가 발생했습니다.";
      setError(`저장 실패 (${status || 'N/A'}): ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#F5F7FA',
        py: 4 
      }}
    >
      <Box maxWidth="800px" mx="auto" px={3}>
        {/* 헤더 섹션 */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            {isEdit ? (
              <>
                <EditIcon sx={{ color: '#113F67', fontSize: 32 }} />
                <Typography variant="h4" sx={{ color: '#113F67', fontWeight: 600 }}>
                  공지사항 수정
                </Typography>
              </>
            ) : (
              <>
                <AddIcon sx={{ color: '#113F67', fontSize: 32 }} />
                <Typography variant="h4" sx={{ color: '#113F67', fontWeight: 600 }}>
                  새 공지 등록
                </Typography>
              </>
            )}
          </Stack>
          <Typography variant="body1" color="#909095">
            {isEdit ? "기존 공지사항을 수정합니다." : "새로운 공지사항을 등록합니다."}
          </Typography>
        </Box>

        {/* 에러 알림 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#FFEBEE',
              border: '1px solid #F44336',
              '& .MuiAlert-icon': { color: '#D32F2F' }
            }} 
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* 폼 */}
        <Paper 
          sx={{ 
            p: 4, 
            boxShadow: '0 4px 20px rgba(17, 63, 103, 0.1)',
            borderRadius: 3,
            backgroundColor: '#FFFFFF'
          }}
        >
          <Stack spacing={4}>
            {/* 제목 입력 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#2A2A2A', mb: 2, fontWeight: 600 }}>
                제목 <Chip label="필수" size="small" sx={{ backgroundColor: '#E3F2FD', color: '#1976D2', ml: 1 }} />
              </Typography>
              <TextField 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                fullWidth 
                required
                placeholder="공지사항 제목을 입력하세요"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#E0E6ED' },
                    '&:hover fieldset': { borderColor: '#58A0C8' },
                    '&.Mui-focused fieldset': { borderColor: '#113F67' }
                  }
                }}
              />
            </Box>

            {/* 내용 입력 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#2A2A2A', mb: 2, fontWeight: 600 }}>
                내용 <Chip label="필수" size="small" sx={{ backgroundColor: '#E3F2FD', color: '#1976D2', ml: 1 }} />
              </Typography>
              <TextField 
                name="content" 
                value={form.content} 
                onChange={handleChange} 
                fullWidth 
                multiline 
                rows={12}
                required
                placeholder="공지사항 내용을 입력하세요"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#E0E6ED' },
                    '&:hover fieldset': { borderColor: '#58A0C8' },
                    '&.Mui-focused fieldset': { borderColor: '#113F67' }
                  }
                }}
              />
            </Box>

            <Divider sx={{ borderColor: '#E0E6ED' }} />

            {/* 상단 고정 옵션 */}
            <Box>
          <FormControlLabel
                control={
                  <Switch 
                    checked={form.pinned} 
                    onChange={handleChange}
                    name="pinned"
                    disabled={loading}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#113F67',
                        '&:hover': { backgroundColor: 'rgba(17, 63, 103, 0.08)' }
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#113F67'
                      }
                    }}
                  />
                }
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PinIcon sx={{ color: form.pinned ? '#113F67' : '#909095' }} />
                    <Typography variant="body1" sx={{ color: '#2A2A2A', fontWeight: 500 }}>
                      상단 고정
                    </Typography>
                    <Chip 
                      label="중요 공지" 
                      size="small" 
                      sx={{ 
                        backgroundColor: form.pinned ? '#E8F5E8' : '#F5F5F5',
                        color: form.pinned ? '#2E7D32' : '#909095',
                        fontSize: '0.75rem'
                      }} 
                    />
                  </Stack>
                }
              />
              <Typography variant="body2" color="#909095" sx={{ mt: 1, ml: 4 }}>
                중요한 공지사항을 최상단에 고정하여 사용자들이 쉽게 확인할 수 있습니다.
              </Typography>
            </Box>

            {/* 버튼 그룹 */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" pt={2}>
              <Button 
                onClick={() => navigate(-1)} 
                variant="outlined"
                disabled={loading}
                startIcon={<CancelIcon />}
                sx={{ 
                  borderColor: '#E0E6ED',
                  color: '#909095',
                  '&:hover': { 
                    borderColor: '#909095',
                    backgroundColor: 'rgba(144, 144, 149, 0.04)'
                  }
                }}
              >
                취소
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit} 
                disabled={loading}
                startIcon={loading ? null : <SaveIcon />}
                sx={{ 
                  backgroundColor: '#113F67',
                  '&:hover': { backgroundColor: '#0d2d4f' },
                  '&:disabled': { backgroundColor: '#E0E6ED' },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                {loading ? "처리중..." : (isEdit ? "수정 완료" : "등록 완료")}
              </Button>
          </Stack>
        </Stack>
      </Paper>
      </Box>
    </Box>
  );
}
