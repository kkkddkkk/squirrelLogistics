// src/api/cars.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Driver 차량 관리 API
export const carApi = {
  // 차량 목록 조회
  getMyCars: async (token) => {
    const response = await axios.get(`${BASE_URL}/api/cars/driver`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 차량 상세 조회
  getMyCar: async (carId, token) => {
    const response = await axios.get(`${BASE_URL}/api/cars/driver/${carId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 차량 추가
  createCar: async (carData, token) => {
    const response = await axios.post(`${BASE_URL}/api/cars/driver`, carData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 차량 수정
  updateCar: async (carId, carData, token) => {
    const response = await axios.put(`${BASE_URL}/api/cars/driver/${carId}`, carData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 차량 삭제
  deleteCar: async (carId, token) => {
    const response = await axios.delete(`${BASE_URL}/api/cars/driver/${carId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 차량 일괄 저장 (기존 기능)
  batchSaveCars: async (batchData, token) => {
    const response = await axios.post(`${BASE_URL}/api/cars/batch`, batchData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// 차량 타입 조회 API
export const vehicleTypeApi = {
  getVehicleTypes: async () => {
    const response = await axios.get(`${BASE_URL}/api/vehicle-types`);
    return response.data;
  }
};
