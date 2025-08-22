import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getInquiryById, submitAnswer, getAnswerByReportId, updateAnswer, deleteAnswer } from "./inquiryApi";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";

const InquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [inquiry, setInquiry] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [hasAnswer, setHasAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // 답변 입력 관련 상태
  const [answerInput, setAnswerInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // 삭제 확인 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 실제 API 호출로 신고/문의 및 답변 데이터 로드
  useEffect(() => {
    loadInquiryData();
  }, [id]);

  const loadInquiryData = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("신고/문의 상세 데이터 로드 시작 (ID):", id);
      
      // 신고/문의 상세 정보 로드
      const inquiryData = await getInquiryById(id);
      console.log("로드된 신고/문의 데이터:", inquiryData);
      
      if (inquiryData) {
        // 🎯 백엔드에서 완전히 처리된 데이터를 단순 매핑
        const mappedInquiry = {
          id: inquiryData.reportId || inquiryData.id,
          userName: inquiryData.reporterDisplay || inquiryData.reporterName || inquiryData.reporter || "사용자",
          title: inquiryData.rTitle || inquiryData.title || "",
          content: inquiryData.rContent || inquiryData.content || "",
          status: inquiryData.rStatus || "상태 없음", // 🎯 백엔드에서 한국어로 완전 처리됨
          createdAt: inquiryData.regDate || inquiryData.createdAt || "",
          category: inquiryData.rCate || inquiryData.category || "기타", // 🎯 백엔드에서 한국어로 완전 처리됨
          place: inquiryData.place || "",
          deliveryAssignmentId: inquiryData.deliveryAssignmentId || null,
          reporterType: inquiryData.reporterType || "",
          startAddress: inquiryData.startAddress || "주소 정보 없음",
          endAddress: inquiryData.endAddress || "주소 정보 없음"
        };
        
        console.log("✅ 매핑된 신고/문의 데이터:", mappedInquiry);
        console.log("🔍 상태값 확인: rStatus =", inquiryData.rStatus, "→ status =", mappedInquiry.status);
        
        setInquiry(mappedInquiry);
        
        // 답변 데이터도 함께 로드
        await loadAnswerData(id);
      } else {
        setError("신고/문의를 찾을 수 없습니다.");
      }
    } catch (e) {
      console.error("신고/문의 데이터 로드 실패:", e);
      setError("신고/문의 정보를 불러오지 못했습니다: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAnswerData = async (reportId) => {
    try {
      console.log("답변 데이터 로드 시작 (reportId):", reportId);
      
      const answerData = await getAnswerByReportId(reportId);
      console.log("로드된 답변 데이터:", answerData);
      
      if (answerData && Array.isArray(answerData) && answerData.length > 0) {
        // 🎯 배열 형태의 답변 데이터에서 첫 번째 답변 사용
        const firstAnswer = answerData[0];
        const mappedAnswer = {
          id: firstAnswer.answerId || firstAnswer.id,
          content: firstAnswer.content || "",
          createdAt: firstAnswer.regDate || firstAnswer.createdAt || "",
          updatedAt: firstAnswer.modiDate || firstAnswer.updatedAt || ""
        };
        
        console.log("✅ 매핑된 답변 데이터:", mappedAnswer);
        setAnswer(mappedAnswer);
        setHasAnswer(true);
      } else if (answerData && !Array.isArray(answerData)) {
        // 🎯 단일 답변 데이터인 경우
        const mappedAnswer = {
          id: answerData.answerId || answerData.id,
          content: answerData.content || "",
          createdAt: answerData.regDate || answerData.createdAt || "",
          updatedAt: answerData.modiDate || answerData.updatedAt || ""
        };
        
        console.log("✅ 매핑된 답변 데이터 (단일):", mappedAnswer);
        setAnswer(mappedAnswer);
        setHasAnswer(true);
      } else {
        console.log("답변이 없습니다.");
        setAnswer(null);
        setHasAnswer(false);
      }
    } catch (e) {
      console.error("답변 데이터 로드 실패:", e);
      console.error("🔍 에러 상세 정보:", {
        message: e.message,
        status: e.response?.status,
        data: e.response?.data
      });
      // 답변이 없는 경우는 에러가 아님
      setAnswer(null);
      setHasAnswer(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerInput.trim()) {
      setError("답변을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      console.log("답변 등록 요청:", { reportId: id, content: answerInput });
      
      const result = await submitAnswer(id, answerInput);
      console.log("답변 등록 결과:", result);
      
      setSuccess("답변이 성공적으로 등록되었습니다.");
      setAnswerInput("");
      
      // 답변 데이터 다시 로드
      await loadAnswerData(id);
      
      // 2초 후 목록 페이지로 이동
      setTimeout(() => {
        navigate("/admin/support/inquiry");
      }, 2000);
      
    } catch (e) {
      console.error("답변 등록 실패:", e);
      setError("답변 등록에 실패했습니다: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAnswer = () => {
    setIsEditing(true);
    setEditContent(answer.content);
  };

  const handleUpdateAnswer = async () => {
    if (!editContent.trim()) {
      setError("답변 내용을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      console.log("답변 수정 요청:", { answerId: answer.id, content: editContent });
      
      const result = await updateAnswer(answer.id, editContent);
      console.log("답변 수정 결과:", result);
      
      setSuccess("답변이 성공적으로 수정되었습니다.");
      setIsEditing(false);
      
      // 답변 데이터 다시 로드
      await loadAnswerData(id);
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (e) {
      console.error("답변 수정 실패:", e);
      setError("답변 수정에 실패했습니다: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnswer = async () => {
    try {
      setSubmitting(true);
      setError("");
      
      console.log("답변 삭제 요청 (answerId):", answer.id);
      
      await deleteAnswer(answer.id);
      console.log("답변 삭제 완료");
      
      setSuccess("답변이 성공적으로 삭제되었습니다.");
      setAnswer(null);
      setHasAnswer(false);
      setDeleteDialogOpen(false);
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (e) {
      console.error("답변 삭제 실패:", e);
      setError("답변 삭제에 실패했습니다: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "답변 완료":
        return "success";
      case "조치 완료":
        return "success";
      case "완료":
        return "success";
      case "처리 중":
        return "warning";
      case "검토 중":
        return "info";
      case "대기 중":
        return "error";
      case "미처리":
        return "error";
      default:
        return "default";
    }
  };

  const getReporterTypeColor = (type) => {
    switch (type) {
      case "DRIVER":
        return "primary";
      case "COMPANY":
        return "secondary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Stack spacing={3} alignItems="center">
          <CircularProgress size={48} sx={{ color: '#113F67' }} />
          <Typography variant="h6" color="#909095">
            신고/문의 정보를 불러오는 중...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!inquiry) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ mb: 3 }}>
          신고/문의를 찾을 수 없습니다.
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/support/inquiry")}
        >
          목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      {/* 헤더 */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton 
          onClick={() => navigate("/admin/support/inquiry")}
          sx={{ color: '#58A0C8' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          신고/문의 상세보기
        </Typography>
      </Stack>

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

      {/* 신고/문의 정보 */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              {inquiry.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Typography variant="body1" color="text.secondary">
                작성자: {inquiry.userName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                작성일: {dayjs(inquiry.createdAt).format("YYYY.MM.DD HH:mm")}
              </Typography>
              {inquiry.place && (
                <Typography variant="body1" color="text.secondary">
                  장소: {inquiry.place}
                </Typography>
              )}
              {inquiry.deliveryAssignmentId && (
                <Typography variant="body1" color="text.secondary">
                  배송ID: {inquiry.deliveryAssignmentId}
                </Typography>
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={inquiry.status} 
                color={getStatusColor(inquiry.status)}
                size="small"
              />
              {inquiry.category && (
                <Chip 
                  label={inquiry.category} 
                  variant="outlined"
                  size="small"
                />
              )}
              {inquiry.reporterType && (
                <Chip 
                  label={inquiry.reporterType === 'DRIVER' ? '기사' : 
                         inquiry.reporterType === 'COMPANY' ? '업체' : 
                         inquiry.reporterType === 'SYSTEM' ? '시스템' : inquiry.reporterType} 
                  color={getReporterTypeColor(inquiry.reporterType)}
                  size="small"
                />
              )}
            </Stack>
          </Box>
        </Stack>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body1" sx={{ 
          whiteSpace: "pre-line", 
          lineHeight: 1.8,
          fontSize: '1.1rem',
          color: '#2A2A2A'
        }}>
          {inquiry.content}
        </Typography>
      </Paper>

      {/* 답변 섹션 */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#113F67' }}>
          관리자 답변
        </Typography>

        {hasAnswer ? (
          // 기존 답변 표시
          <Box>
            <Box 
              sx={{ 
                p: 3, 
                backgroundColor: '#F8F9FA', 
                borderRadius: 2, 
                border: '1px solid #E9ECEF',
                mb: 3
              }}
            >
              <Typography variant="body1" sx={{ 
                whiteSpace: "pre-line", 
                lineHeight: 1.8,
                fontSize: '1.1rem',
                color: '#2A2A2A'
              }}>
                {answer.content}
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary">
                  답변일: {dayjs(answer.createdAt).format("YYYY.MM.DD HH:mm")}
                  {answer.updatedAt && answer.updatedAt !== answer.createdAt && 
                    ` (수정: ${dayjs(answer.updatedAt).format("YYYY.MM.DD HH:mm")})`
                  }
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="답변 수정">
                    <IconButton 
                      size="small" 
                      onClick={handleEditAnswer}
                      sx={{ color: '#58A0C8' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="답변 삭제">
                    <IconButton 
                      size="small" 
                      onClick={() => setDeleteDialogOpen(true)}
                      sx={{ color: '#F44336' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

            {/* 답변 수정 폼 */}
            {isEditing && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  답변 수정
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="수정할 답변을 입력해주세요"
                  sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                    disabled={submitting}
                  >
                    취소
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdateAnswer}
                    disabled={!editContent.trim() || submitting}
                    sx={{ 
                      backgroundColor: '#113F67',
                      '&:hover': { backgroundColor: '#0D2B4A' }
                    }}
                  >
                    {submitting ? <CircularProgress size={20} /> : "수정 완료"}
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        ) : (
          // 새 답변 입력 폼
          <Box>
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="신고/문의에 대한 답변을 입력해주세요"
              sx={{ mb: 3 }}
            />
            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={handleSubmitAnswer}
                disabled={!answerInput.trim() || submitting}
                sx={{ 
                  backgroundColor: '#113F67',
                  '&:hover': { backgroundColor: '#0D2B4A' }
                }}
              >
                {submitting ? <CircularProgress size={20} /> : "답변 등록"}
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* 답변 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>답변 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 이 답변을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            취소
          </Button>
          <Button 
            onClick={handleDeleteAnswer} 
            color="error" 
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InquiryDetail;
