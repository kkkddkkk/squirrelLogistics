// src/api/vehicles.js
import dayjs from "dayjs";

export async function fetchVehicles({ page = 1, size = 10, keyword = "", status = "" }) {
  try {
    // 실제 API 연결 시 여기에 axios 호출 작성
    throw new Error("mock");
  } catch {
    const all = Array.from({ length: 47 }).map((_, i) => ({
      id: i + 1,
      vehicleNumber: `24구 ${2000 + i}`,
      driverName: `기사 ${i + 1}`,
      firstRegistrationDate: "2023-01-15",
      vehicleType: i % 3 === 0 ? "윙바디" : i % 3 === 1 ? "탑차" : "카고",
      loadCapacityKg: (i % 5 + 1) * 1000,
      status: i % 4 === 0 ? "정비중" : "운행 가능",
      currentDistanceKm: 12000 + i * 350,
      lastInspectionDate: "2024-09-03",
      nextInspectionDate: dayjs("2024-09-03").add(11, "month").format("YYYY-MM-DD"),
      insurance: i % 2 === 0 ? "유" : "무",
    }));

    const filtered = all.filter(v => {
      const passKeyword = keyword ? (v.vehicleNumber.includes(keyword) || v.driverName.includes(keyword)) : true;
      const passStatus = status ? v.status === status : true;
      return passKeyword && passStatus;
    });

    const start = (page - 1) * size;
    return {
      items: filtered.slice(start, start + size),
      total: filtered.length,
    };
  }
}

export async function fetchVehicleById(id) {
  try {
    throw new Error("mock");
  } catch {
    return {
      id,
      vehicleNumber: `24구 ${2000 + Number(id)}`,
      driverName: `기사 ${id}`,
      firstRegistrationDate: "2023-01-15",
      vehicleType: "윙바디",
      loadCapacityKg: 2000,
      status: "운행 가능",
      currentDistanceKm: 35090,
      lastInspectionDate: "2024-09-03",
      nextInspectionDate: "2025-08-03",
      insurance: "유",
    };
  }
}

export async function createVehicle(payload) { return { ok: true }; }
export async function updateVehicle(id, payload) { return { ok: true }; }
export async function deleteVehicle(id) { return { ok: true }; }
