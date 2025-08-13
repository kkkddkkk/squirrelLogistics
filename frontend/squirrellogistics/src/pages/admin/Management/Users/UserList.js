import React, { useEffect, useState } from "react";
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination, Stack, Button, Chip, Divider
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchUsers, deleteUser } from "../../../../api/users";
import UserDetailDialog from "./components/UserDetailDialog";

const colorByStatus = (s) => (s === "ACTIVE" ? "success" : "warning");

export default function UserList({ query }) {
  console.log("🔵 UserList v2 mounted"); // ← 이게 보이면 새 파일이 적용된 것
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      const data = await fetchUsers({
        page: page + 1,
        size: rowsPerPage,
        keyword: query?.keyword || "",
        role: query?.role || "",
      });
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch {
      // 데모 데이터(운전자/물류회사 혼합)
      const mock = Array.from({ length: 10 }).flatMap((_, i) => {
        const d = i * 2 + 1, c = i * 2 + 2;
        return [
          {
            id: d, userType: "DRIVER", role: "DRIVER", status: "ACTIVE",
            name: `기사 ${d}`, username: `driver${d}`, email: `driver${d}@mail.com`, phone: "010-2342-2432",
            birth: "1989-02-19", account: "3333-1988-67613", bizRegNo: "123-222-2342",
            address: "서울 강남구 역삼동", addressDetail: "테헤란로 123 10층",
            vehicleType: "윙바디", vehicleNumber: `24구 ${2800 + d}`, driverLicenseNo: `11-${900000 + d}`,
            licenseValidUntil: "2027-12-31",
            preferredStart: "07:00", preferredEnd: "18:00", preferredRegions: ["서울","경기","인천"],
            rating: 4.3, tagline: "오늘도 안전운전하세요!",
          },
          {
            id: c, userType: "COMPANY", role: "USER", status: c % 4 === 0 ? "DISABLED" : "ACTIVE",
            name: `테스트 주식회사 ${i + 1}`, companyName: `테스트 주식회사 ${i + 1}`,
            username: `corp${i + 1}`, email: `corp${i + 1}@mail.com`, phone: "02-123-4567",
            address: "서울 강남구 역삼동", addressDetail: "테헤란로 77 5층",
            bizRegNo: "123-45-67890", mainAccount: "12345678901234",
          },
        ];
      });

      const kw = (query?.keyword || "").trim();
      const filtered = mock.filter(u => {
        const hit = kw
          ? [u.name, u.companyName, u.email, u.username].some(v => v && v.includes(kw))
          : true;
        const passRole = query?.role ? u.role === query.role : true;
        return hit && passRole;
      });

      const start = page * rowsPerPage;
      setRows(filtered.slice(start, start + rowsPerPage));
      setTotal(filtered.length);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, rowsPerPage, query]);

  const onDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteUser(id);
      await load();
    } catch {
      setRows(prev => prev.filter(r => r.id !== id));
      setTotal(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>유형</TableCell>
            <TableCell>이름/회사</TableCell>
            <TableCell>아이디</TableCell>
            <TableCell>이메일</TableCell>
            <TableCell>연락처</TableCell>
            <TableCell>추가정보</TableCell>{/* 운전자=차량번호 / 물류=사업자번호 */}
            <TableCell>상태</TableCell>
            <TableCell align="right">작업</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Chip size="small" label={row.userType === "DRIVER" ? "배송기사" : "물류회사"} />
              </TableCell>
              <TableCell sx={{ cursor: "pointer", maxWidth: 220 }} onClick={() => setSelected(row)} title="상세 보기">
                {row.userType === "DRIVER" ? row.name : (row.companyName || row.name)}
              </TableCell>
              <TableCell>{row.username}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>
                {row.userType === "DRIVER" ? (row.vehicleNumber || "-") : (row.bizRegNo || "-")}
              </TableCell>
              <TableCell>
                <Chip size="small" label={row.status} color={colorByStatus(row.status)} />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined"
                    onClick={() => navigate(`/admin/management/users/${row.id}`)}>
                    수정
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => onDelete(row.id)}>
                    삭제
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={8} align="center">데이터가 없습니다.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Divider />
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 20, 50]}
      />

      <UserDetailDialog open={!!selected} row={selected} onClose={() => setSelected(null)} />
    </Paper>
  );
}
