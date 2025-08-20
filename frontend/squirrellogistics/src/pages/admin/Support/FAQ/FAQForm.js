import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFaqById, updateFaq, createFaq } from "./faqApi";
import { 
  Box, Button, Stack, TextField, Typography, Paper, Alert,
  FormControl, Select, MenuItem, Chip, Divider
} from "@mui/material";
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Edit as EditIcon, 
  Add as AddIcon,
  Help as HelpIcon,
  Category as CategoryIcon
} from "@mui/icons-material";

const FAQForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    question: "", 
    answer: "", 
    category: "DELIVERY" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // 성공 메시지 추가

  // 카테고리 옵션
  const categories = [
    { value: "DELIVERY", label: "배송", color: "#58A0C8" },
    { value: "PAYMENT", label: "결제", color: "#34699A" },
    { value: "SERVICE", label: "서비스", color: "#31A04F" },
    { value: "ACCOUNT", label: "계정", color: "#E8A93F" },
    { value: "EVENT", label: "이벤트", color: "#A20025" },
    { value: "ETC", label: "기타", color: "#909095" }
  ];

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getFaqById(id)
        .then(data => {
          setForm({ 
            question: data.question || "", 
            answer: data.answer || "", 
            category: data.category || "DELIVERY" 
          });
          setError(""); // 에러 메시지 초기화
        })
        .catch(e => {
          console.error("FAQ 데이터 로드 실패:", e);
          
          // 백엔드 서버 연결 실패인지 확인
          if (e.message && e.message.includes("Network Error")) {
            setError("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
          } else if (e.message && e.message.includes("ERR_CONNECTION_REFUSED")) {
            setError("백엔드 서버(포트 8080)에 연결할 수 없습니다. 서버를 실행해주세요.");
          } else {
            setError(`데이터 불러오기 실패: ${e.message}`);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(""); // 에러 메시지 초기화
  };

  const handleSubmit = async () => {
    if (!form.question.trim()) {
      setError("질문을 입력해주세요.");
      return;
    }
    if (!form.answer.trim()) {
      setError("답변을 입력해주세요.");
      return;
    }
    
    try {
      setLoading(true);
      setError(""); // 에러 메시지 초기화
      
      let result;
      if (isEdit) {
        result = await updateFaq(id, form);
        console.log("FAQ 수정 완료:", result);
      } else {
        result = await createFaq(form);
        console.log("FAQ 생성 완료:", result);
      }
      
      // 성공 메시지 표시 후 페이지 이동
      if (result) {
        // 성공 메시지 설정
        if (isEdit) {
          setSuccess("FAQ가 성공적으로 수정되었습니다!");
        } else {
          setSuccess("FAQ가 성공적으로 등록되었습니다!");
        }
        
        // 에러 메시지 초기화
        setError("");
        
        // 2초 후 FAQ 목록 페이지로 이동
        setTimeout(() => {
          navigate("/admin/support/faq");
        }, 2000);
      }
    } catch (e) {
      console.error("FAQ 저장 에러:", e);
      setError(`저장 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
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
                  FAQ 수정
                </Typography>
              </>
            ) : (
              <>
                <AddIcon sx={{ color: '#113F67', fontSize: 32 }} />
                <Typography variant="h4" sx={{ color: '#113F67', fontWeight: 600 }}>
                  새 FAQ 등록
                </Typography>
              </>
            )}
          </Stack>
          <Typography variant="body1" color="#909095">
            {isEdit ? "기존 FAQ를 수정합니다." : "새로운 FAQ를 등록합니다."}
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
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => {
                  // 백엔드 서버 상태 확인
                  fetch('http://localhost:8080/api/public/faqs')
                    .then(response => {
                      if (response.ok) {
                        setError("백엔드 서버는 정상 작동 중입니다. 다른 문제가 있을 수 있습니다.");
                      } else {
                        setError(`백엔드 서버 응답 오류: ${response.status} ${response.statusText}`);
                      }
                    })
                    .catch(e => {
                      setError(`백엔드 서버 연결 실패: ${e.message}`);
                    });
                }}
              >
                서버 상태 확인
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* 성공 알림 */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#E8F5E8',
              border: '1px solid #4CAF50',
              '& .MuiAlert-icon': { color: '#2E7D32' }
            }} 
            onClose={() => setSuccess("")}
          >
            {success}
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
            {/* 카테고리 선택 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#2A2A2A', mb: 2, fontWeight: 600 }}>
                카테고리
              </Typography>
              <FormControl fullWidth>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={loading}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#E0E6ED' },
                      '&:hover fieldset': { borderColor: '#58A0C8' },
                      '&.Mui-focused fieldset': { borderColor: '#113F67' }
                    }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          backgroundColor: category.color 
                        }} />
                        <Typography>{category.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="body2" color="#909095" sx={{ mt: 1 }}>
                FAQ의 주제에 맞는 카테고리를 선택해주세요.
              </Typography>
            </Box>

            {/* 질문 입력 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#2A2A2A', mb: 2, fontWeight: 600 }}>
                질문
              </Typography>
              <TextField 
                name="question" 
                value={form.question} 
                onChange={handleChange} 
                fullWidth 
                required
                placeholder="자주 묻는 질문을 입력하세요"
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

            {/* 답변 입력 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#2A2A2A', mb: 2, fontWeight: 600 }}>
                답변
              </Typography>
              <TextField 
                name="answer" 
                value={form.answer} 
                onChange={handleChange} 
                fullWidth 
                multiline 
                rows={8}
                required
                placeholder="질문에 대한 답변을 상세히 입력하세요"
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

            {/* 미리보기 */}
            <Box>
              <Typography variant="h6" sx={{ color: '#2A2A2A', mb: 2, fontWeight: 600 }}>
                미리보기
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: '#F8F9FA', border: '1px solid #E0E6ED' }}>
      <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip 
                      label={getCategoryInfo(form.category).label}
                      size="small"
                      sx={{ 
                        backgroundColor: getCategoryInfo(form.category).color,
                        color: '#FFFFFF',
                        fontWeight: 600
                      }}
                    />
                    <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600 }}>
                      Q. {form.question || "질문을 입력하세요"}
                    </Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: '#2A2A2A', lineHeight: 1.6 }}>
                    A. {form.answer || "답변을 입력하세요"}
                  </Typography>
                </Stack>
              </Paper>
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
};

export default FAQForm;
