import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from "@mui/material";
import {
  Policy as PolicyIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { getPolicyById, createPolicy, updatePolicy } from "./policyApi";

const PolicyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "ETC"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 정책 타입 옵션
  const policyTypes = [
    { value: "TERMS_OF_SERVICE", label: "서비스이용약관", color: "#58A0C8" },
    { value: "PRIVACY_POLICY", label: "개인정보처리방침", color: "#34699A" },
    { value: "DELIVERY_POLICY", label: "배송정책", color: "#31A04F" },
    { value: "REFUND_POLICY", label: "환불/교환정책", color: "#E8A93F" },
    { value: "SECURITY_POLICY", label: "보안정책", color: "#A20025" },
    { value: "ETC", label: "기타", color: "#909095" }
  ];

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (isEdit) {
      loadPolicy();
    }
  }, [id]);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await getPolicyById(id);
      console.log("로드된 정책 데이터:", data);
      
      if (data) {
        setForm({
          title: data.title || "",
          content: data.content || "",
          type: data.type || "ETC"
        });
      }
    } catch (e) {
      console.error("정책 데이터 로드 실패:", e);
      setError(`정책 데이터를 불러오지 못했습니다: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
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
      
      let result;
      if (isEdit) {
        result = await updatePolicy(id, form);
        console.log("정책 수정 완료:", result);
      } else {
        result = await createPolicy(form);
        console.log("정책 생성 완료:", result);
      }
      
      // 성공 메시지 표시 후 페이지 이동
      if (result) {
        // 성공 메시지 설정
        if (isEdit) {
          setSuccess("정책이 성공적으로 수정되었습니다!");
        } else {
          setSuccess("정책이 성공적으로 등록되었습니다!");
        }
        
        // 에러 메시지 초기화
        setError("");
        
        // 2초 후 정책 목록 페이지로 이동
        setTimeout(() => {
          navigate("/admin/support/policy");
        }, 2000);
      }
    } catch (e) {
      console.error("정책 저장 에러:", e);
      setError(`저장 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (typeValue) => {
    return policyTypes.find(type => type.value === typeValue) || policyTypes[policyTypes.length - 1];
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#F5F7FA',
        py: 4 
      }}
    >
      <Box maxWidth="1000px" mx="auto" px={3}>
        {/* 헤더 섹션 */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <PolicyIcon sx={{ color: '#113F67', fontSize: 40 }} />
            <Typography variant="h3" sx={{ color: '#113F67', fontWeight: 700 }}>
              {isEdit ? "정책 수정" : "정책 등록"}
            </Typography>
          </Stack>
          <Typography variant="body1" color="#909095" sx={{ fontSize: '1.1rem' }}>
            {isEdit ? "기존 정책을 수정할 수 있습니다." : "새로운 정책을 등록할 수 있습니다."}
          </Typography>
        </Box>

        {/* 성공 알림 */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#E8F5E8',
              border: '1px solid #4CAF50',
              borderRadius: 2,
              '& .MuiAlert-icon': { color: '#2E7D32' }
            }} 
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        {/* 에러 알림 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#FFEBEE',
              border: '1px solid #F44336',
              borderRadius: 2,
              '& .MuiAlert-icon': { color: '#D32F2F' }
            }} 
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* 폼 */}
        <Paper sx={{ 
          p: 4,
          boxShadow: '0 4px 20px rgba(17, 63, 103, 0.1)',
          borderRadius: 3
        }}>
          <Stack spacing={4}>
            {/* 정책 타입 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#2A2A2A', mb: 2, fontWeight: 600 }}>
                정책 타입
              </Typography>
              <FormControl fullWidth>
                <Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#E0E6ED' },
                      '&:hover fieldset': { borderColor: '#58A0C8' },
                      '&.Mui-focused fieldset': { borderColor: '#113F67' }
                    }
                  }}
                >
                  {policyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: type.color 
                        }} />
                        <span>{type.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* 제목 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#2A2A2A', mb: 2, fontWeight: 600 }}>
                제목
              </Typography>
              <TextField
                fullWidth
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="정책 제목을 입력하세요"
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

            <Divider />

            {/* 내용 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#2A2A2A', mb: 2, fontWeight: 600 }}>
                내용
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={8}
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="정책 내용을 입력하세요"
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

            {/* 버튼 */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/admin/support/policy")}
                disabled={loading}
                sx={{ 
                  borderColor: '#58A0C8',
                  color: '#58A0C8',
                  '&:hover': { 
                    borderColor: '#34699A',
                    backgroundColor: 'rgba(88, 160, 200, 0.04)'
                  }
                }}
              >
                목록으로
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
                sx={{ 
                  backgroundColor: '#113F67',
                  '&:hover': { backgroundColor: '#0d2d4f' },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(17, 63, 103, 0.3)'
                }}
              >
                {loading ? "저장 중..." : (isEdit ? "수정하기" : "등록하기")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default PolicyForm;
