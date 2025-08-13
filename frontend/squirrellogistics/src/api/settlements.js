// src/api/settlements.js
import axios from "axios";

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api",
});

// 정산 목록
export const fetchSettlements = async ({
  page = 1,
  size = 10,
  keyword = "",
  status = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const { data } = await client.get("/admin/settlements", {
    params: { page, size, keyword, status, startDate, endDate },
  });
  return data; // { items: [], total: 0 }
};

export const fetchSettlementById = async (id) => {
  const { data } = await client.get(`/admin/settlements/${id}`);
  return data;
};

export const createSettlement = async (payload) => {
  const { data } = await client.post("/admin/settlements", payload);
  return data;
};

export const updateSettlement = async (id, payload) => {
  const { data } = await client.put(`/admin/settlements/${id}`, payload);
  return data;
};

export const deleteSettlement = async (id) => {
  const { data } = await client.delete(`/admin/settlements/${id}`);
  return data;
};

// ✅ 일괄 상태 업데이트 (APPROVED/PAID 등)
export const bulkUpdateSettlementStatus = async ({ ids, status }) => {
  const { data } = await client.put(`/admin/settlements/status`, { ids, status });
  return data; // { updated: number }
};

/* ====== 백엔드 전 CSV 내보내기 유틸 ======
   실제 서버에서 엑셀을 만들면 아래는 불필요합니다. */
export const exportToCSV = (rows, filename = "settlements.csv") => {
  if (!rows?.length) return;
  const headers = [
    "id","settlementNo","orderNo","partner",
    "amount","fee","vat","total","status","settledAt"
  ];
  const escape = (v) => {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const toMoney = (n) => (n ?? 0);
  const lines = [
    headers.join(","),
    ...rows.map(r => [
      r.id,
      escape(r.settlementNo),
      escape(r.orderNo),
      escape(r.partner),
      toMoney(r.amount),
      toMoney(r.fee),
      toMoney(r.vat),
      toMoney((r.amount ?? 0) - (r.fee ?? 0) + (r.vat ?? 0)),
      r.status,
      r.settledAt,
    ].join(","))
  ];
  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
