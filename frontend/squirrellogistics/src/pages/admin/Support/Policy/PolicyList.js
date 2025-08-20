import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Stack,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Policy as PolicyIcon,
  Category as CategoryIcon,
  Clear as ClearIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getPolicies, deletePolicy } from "./policyApi";

const PolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 정책 타입 옵션
  const policyTypes = [
    { value: "ALL", label: "전체", color: "#113F67" },
    { value: "TERMS_OF_SERVICE", label: "서비스이용약관", color: "#58A0C8" },
    { value: "PRIVACY_POLICY", label: "개인정보처리방침", color: "#34699A" },
    { value: "DELIVERY_POLICY", label: "배송정책", color: "#31A04F" },
    { value: "REFUND_POLICY", label: "환불/교환정책", color: "#E8A93F" },
    { value: "SECURITY_POLICY", label: "보안정책", color: "#A20025" },
    { value: "ETC", label: "기타", color: "#909095" }
  ];

  // 실제 API 호출로 정책 데이터 로드
  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("정책 데이터 로드 시작...");
      const data = await getPolicies();
      console.log("로드된 정책 데이터:", data);
      
      if (data && Array.isArray(data)) {
        // 백엔드 데이터 구조에 맞게 매핑
        const mappedPolicies = data.map(policy => ({
          id: policy.policyId || policy.id,
          title: policy.title || "",
          content: policy.content || "",
          type: policy.type || "ETC",
          createdAt: policy.regDate || policy.createdAt,
          updatedAt: policy.modiDate || policy.updatedAt
        }));
        
        console.log("매핑된 정책 데이터:", mappedPolicies);
        setPolicies(mappedPolicies);
      } else {
        console.warn("정책 데이터가 배열이 아닙니다:", data);
        setPolicies([]);
      }
    } catch (e) {
      console.error("정책 데이터 로드 실패:", e);
      setError(`정책 목록을 불러오지 못했습니다: ${e.message}`);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 정책 데이터 로드
  useEffect(() => {
    loadPolicies();
  }, []);

  // 새로고침 버튼
  const handleRefresh = () => {
    loadPolicies();
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말 삭제하시겠습니까?\n삭제된 정책은 복구할 수 없습니다.")) {
      try {
        await deletePolicy(id);
        // 삭제 후 목록 새로고침
        await loadPolicies();
      } catch (e) {
        setError(`삭제 실패: ${e.message}`);
      }
    }
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSelectedType("ALL");
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = policy.title.toLowerCase().includes(search.toLowerCase()) ||
                         policy.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "ALL" || policy.type === selectedType;
    return matchesSearch && matchesType;
  });

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
      <Box maxWidth="1200px" mx="auto" px={3}>
        {/* 헤더 섹션 */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <PolicyIcon sx={{ color: '#113F67', fontSize: 40 }} />
            <Typography variant="h3" sx={{ color: '#113F67', fontWeight: 700 }}>
              정책 관리
            </Typography>
          </Stack>
          <Typography variant="body1" color="#909095" sx={{ fontSize: '1.1rem' }}>
            서비스 정책을 등록, 수정, 삭제할 수 있습니다.
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
              borderRadius: 2,
              '& .MuiAlert-icon': { color: '#D32F2F' }
            }} 
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* 검색 및 필터 */}
        <Paper sx={{ 
          p: 3, 
          mb: 3,
          boxShadow: '0 2px 12px rgba(17, 63, 103, 0.08)',
          borderRadius: 3
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600 }}>
              검색 및 필터
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined"
                onClick={handleRefresh}
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
                새로고침
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => navigate("new")}
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
                정책 등록
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              size="medium"
              placeholder="제목 또는 내용으로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#58A0C8' }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#E0E6ED' },
                  '&:hover fieldset': { borderColor: '#58A0C8' },
                  '&.Mui-focused fieldset': { borderColor: '#113F67' }
                }
              }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <Select
                value={selectedType}
                onChange={handleTypeChange}
                sx={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#E0E6ED' },
                  '&:hover fieldset': { borderColor: '#58A0C8' },
                  '&.Mui-focused fieldset': { borderColor: '#113F67' }
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
          </Stack>

          {/* 검색 결과 요약 */}
          <Typography variant="body2" color="#909095">
            총 <strong>{policies.length}</strong>개 중 <strong>{filteredPolicies.length}</strong>개 표시
            {search && ` (검색어: "${search}")`}
            {selectedType !== "ALL" && ` (타입: ${getTypeInfo(selectedType).label})`}
          </Typography>
        </Paper>

        {/* 정책 목록 */}
        <Paper sx={{ 
          boxShadow: '0 4px 20px rgba(17, 63, 103, 0.1)',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          {loading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size={32} sx={{ color: '#113F67' }} />
              <Typography variant="body1" sx={{ mt: 2, color: '#909095' }}>
                정책을 불러오는 중...
              </Typography>
            </Box>
          ) : filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => {
              const typeInfo = getTypeInfo(policy.type);
              return (
                <Accordion key={policy.id} sx={{ 
                  '&:not(:last-child)': { borderBottom: '1px solid #E0E6ED' },
                  '&:before': { display: 'none' }
                }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: '#113F67' }} />}
                    sx={{
                      backgroundColor: '#F8F9FA',
                      '&:hover': { backgroundColor: '#F0F1F2' }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                      <Chip 
                        label={typeInfo.label}
                        size="small"
                        sx={{ 
                          backgroundColor: typeInfo.color,
                          color: '#FFFFFF',
                          fontWeight: 600
                        }}
                      />
                      <Typography variant="h6" sx={{ color: '#2A2A2A', fontWeight: 600 }}>
                        {policy.title}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
                      <Tooltip title="수정" arrow>
                        <Box 
                          component="div"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${policy.id}`);
                          }}
                          sx={{ 
                            color: '#58A0C8',
                            backgroundColor: '#E3F2FD',
                            '&:hover': { backgroundColor: '#BBDEFB' },
                            cursor: 'pointer',
                            borderRadius: 1,
                            p: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <EditIcon />
                        </Box>
                      </Tooltip>
                      <Tooltip title="삭제" arrow>
                        <Box 
                          component="div"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(policy.id);
                          }}
                          sx={{ 
                            backgroundColor: '#FFEBEE',
                            '&:hover': { backgroundColor: '#FFCDD2' },
                            cursor: 'pointer',
                            borderRadius: 1,
                            p: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <DeleteIcon />
                        </Box>
                      </Tooltip>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#FFFFFF', p: 3 }}>
                    <Stack spacing={2}>
                      <Typography variant="body1" sx={{ color: '#2A2A2A', lineHeight: 1.6 }}>
                        {policy.content}
                      </Typography>
                      
                      <Stack direction="row" spacing={2} sx={{ pt: 2, borderTop: '1px solid #E0E6ED' }}>
                        <Typography variant="caption" color="#909095">
                          등록일: {policy.createdAt ? dayjs(policy.createdAt).format("YYYY.MM.DD HH:mm") : "-"}
                        </Typography>
                        {policy.updatedAt && policy.createdAt && !dayjs(policy.createdAt).isSame(dayjs(policy.updatedAt)) && (
                          <Typography variant="caption" color="#E8A93F">
                            수정일: {dayjs(policy.updatedAt).format("MM.DD HH:mm")}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })
          ) : (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <PolicyIcon sx={{ fontSize: 48, color: '#E0E6ED', mb: 2 }} />
              <Typography variant="h6" color="#909095" sx={{ mb: 1 }}>
                {search || selectedType !== "ALL" ? "검색 결과가 없습니다." : "등록된 정책이 없습니다."}
              </Typography>
              <Typography variant="body2" color="#909095">
                {search || selectedType !== "ALL" ? "다른 검색어나 타입을 시도해보세요." : "새로운 정책을 등록해보세요."}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default PolicyList;
