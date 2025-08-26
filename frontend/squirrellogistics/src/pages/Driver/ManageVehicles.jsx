import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { carApi, vehicleTypeApi } from '../../api/cars';
import dayjs from 'dayjs';

const C = { blue: "#113F67", gold: "#E8A93F" };

export default function ManageVehicles() {
  const [cars, setCars] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedCar, setSelectedCar] = useState(null);
  
  // Form 상태
  const [form, setForm] = useState({
    carNum: '',
    vehicleTypeId: '',
    insurance: true,
    mileage: '',
    etc: '',
    inspection: '',
    carStatus: 'OPERATIONAL'
  });

  // 토큰 가져오기
  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('accessToken') || 'test-token';
  };

  // 차량 목록 조회
  const loadCars = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const carsData = await carApi.getMyCars(token);
      setCars(carsData);
    } catch (err) {
      console.error('차량 목록 조회 실패:', err);
      setError('차량 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 차량 타입 목록 조회
  const loadVehicleTypes = async () => {
    try {
      const typesData = await vehicleTypeApi.getVehicleTypes();
      setVehicleTypes(typesData);
    } catch (err) {
      console.error('차량 타입 목록 조회 실패:', err);
    }
  };

  useEffect(() => {
    loadVehicleTypes();
    loadCars();
  }, []);

  // Dialog 열기
  const handleOpenDialog = (mode, car = null) => {
    setDialogMode(mode);
    setSelectedCar(car);
    
    if (mode === 'edit' && car) {
      setForm({
        carNum: car.carNum || '',
        vehicleTypeId: car.vehicleType?.vehicleTypeId || '',
        insurance: car.insurance || false,
        mileage: car.mileage?.toString() || '',
        etc: car.etc || '',
        inspection: car.inspection ? dayjs(car.inspection).format('YYYY-MM-DD') : '',
        carStatus: car.carStatus || 'OPERATIONAL'
      });
    } else {
      setForm({
        carNum: '',
        vehicleTypeId: '',
        insurance: true,
        mileage: '',
        etc: '',
        inspection: '',
        carStatus: 'OPERATIONAL'
      });
    }
    
    setDialogOpen(true);
  };

  // Dialog 닫기
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCar(null);
    setError('');
  };

  // Form 변경 처리
  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // 차량 저장 (생성/수정)
  const handleSaveCar = async () => {
    try {
      setError('');
      const token = getToken();
      
      const carData = {
        ...form,
        mileage: form.mileage ? parseInt(form.mileage) : 0,
        inspection: form.inspection ? dayjs(form.inspection).toDate() : null
      };

      if (dialogMode === 'create') {
        await carApi.createCar(carData, token);
        alert('차량이 등록되었습니다.');
      } else {
        await carApi.updateCar(selectedCar.carId, carData, token);
        alert('차량이 수정되었습니다.');
      }
      
      handleCloseDialog();
      loadCars(); // 목록 새로고침
    } catch (err) {
      console.error('차량 저장 실패:', err);
      setError(err.response?.data?.message || '차량 저장에 실패했습니다.');
    }
  };

  // 차량 삭제
  const handleDeleteCar = async (carId) => {
    if (!window.confirm('정말로 이 차량을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = getToken();
      await carApi.deleteCar(carId, token);
      alert('차량이 삭제되었습니다.');
      loadCars(); // 목록 새로고침
    } catch (err) {
      console.error('차량 삭제 실패:', err);
      alert('차량 삭제에 실패했습니다.');
    }
  };

  // 차량 상태 표시
  const getStatusChip = (status) => {
    const statusMap = {
      'OPERATIONAL': { label: '운행 가능', color: 'success' },
      'MAINTENANCE': { label: '정비중', color: 'warning' },
      'RETIRED': { label: '폐차', color: 'error' }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'default' };
    return <Chip label={statusInfo.label} color={statusInfo.color} size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ color: C.blue, fontWeight: 700 }}>
          내 차량 관리
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('create')}
          sx={{ bgcolor: C.gold, '&:hover': { bgcolor: '#d69a2e' } }}
        >
          차량 추가
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: C.blue }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>차량번호</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>차종</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>보험</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>주행거리</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>상태</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>점검일</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>등록일</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  등록된 차량이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car) => (
                <TableRow key={car.carId} hover>
                  <TableCell>{car.carNum}</TableCell>
                  <TableCell>{car.vehicleType?.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={car.insurance ? '유' : '무'} 
                      color={car.insurance ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{car.mileage?.toLocaleString()} km</TableCell>
                  <TableCell>{getStatusChip(car.carStatus)}</TableCell>
                  <TableCell>
                    {car.inspection ? dayjs(car.inspection).format('YYYY-MM-DD') : '-'}
                  </TableCell>
                  <TableCell>
                    {car.regDate ? dayjs(car.regDate).format('YYYY-MM-DD') : '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog('edit', car)}
                      sx={{ color: C.blue }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCar(car.carId)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 차량 등록/수정 Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? '차량 등록' : '차량 수정'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="차량번호"
              value={form.carNum}
              onChange={(e) => handleFormChange('carNum', e.target.value)}
              fullWidth
              margin="normal"
              disabled={dialogMode === 'edit'} // 수정 시 차량번호 변경 불가
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>차종</InputLabel>
              <Select
                value={form.vehicleTypeId}
                onChange={(e) => handleFormChange('vehicleTypeId', e.target.value)}
                label="차종"
              >
                {vehicleTypes.map((type) => (
                  <MenuItem key={type.vehicleTypeId} value={type.vehicleTypeId}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={form.insurance}
                  onChange={(e) => handleFormChange('insurance', e.target.checked)}
                />
              }
              label="보험 가입"
              sx={{ mt: 2 }}
            />

            <TextField
              label="주행거리 (km)"
              type="number"
              value={form.mileage}
              onChange={(e) => handleFormChange('mileage', e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              label="기타사항"
              value={form.etc}
              onChange={(e) => handleFormChange('etc', e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />

            <TextField
              label="점검일"
              type="date"
              value={form.inspection}
              onChange={(e) => handleFormChange('inspection', e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>차량 상태</InputLabel>
              <Select
                value={form.carStatus}
                onChange={(e) => handleFormChange('carStatus', e.target.value)}
                label="차량 상태"
              >
                <MenuItem value="OPERATIONAL">운행 가능</MenuItem>
                <MenuItem value="MAINTENANCE">정비중</MenuItem>
                <MenuItem value="RETIRED">폐차</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button 
            onClick={handleSaveCar} 
            variant="contained"
            sx={{ bgcolor: C.blue }}
          >
            {dialogMode === 'create' ? '등록' : '수정'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
