import React from "react";
import {
  Box,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const DeliveredDetail = () => {
  const navigate = useNavigate();

  const deliveryInfo = {
    id: "993323",
    startDate: "2025.08.01",
    endDate: "2025.08.02",
    cargoName: "앰플세럼 세트 외 3건",
    route: [
      { location: "서울 강남구", time: "2025.08.01 08:00" },
      { location: "대전 중구", time: "2025.08.01 13:30" },
      { location: "부산 해운대구", time: "2025.08.02 09:10" },
    ],
  };

  const customer = {
    name: "김인주",
    phone: "010-1234-5678",
    email: "inju.kim@example.com",
  };

  const payment = {
    baseFare: 70000,
    distance: "420km",
    weight: "2.5톤",
    fee: 3000,
    promotion: -5000,
    total: 68000,
  };

  const bankInfo = {
    bank: "국민은행",
    account: "123456-78-901234",
    holder: "(주)마녀공장",
  };

  const formatPrice = (price) => `₩${price.toLocaleString()}`;

  const tableStyle = {
    backgroundColor: "#F5F7FA",
    "& .MuiTableCell-root": {
      borderBottom: "1px solid #ccc",
      borderRight: "none",
    },
  };

  return (
    <Box sx={{ bgcolor: "#F5F7FA", py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom color="#2A2A2A">
          운송 상세
        </Typography>

        <Typography variant="h4" fontWeight="bold" gutterBottom color="#2A2A2A">
          # {deliveryInfo.id}
        </Typography>

        {/* 운송 일정 */}
        <Box my={4}>
          <Box sx={{ borderBottom: "2px solid #ccc", pb: 1, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              운송 일정
            </Typography>
          </Box>
          <Box sx={tableStyle}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>운송 ID</TableCell>
                  <TableCell>{deliveryInfo.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>운송 시작일</TableCell>
                  <TableCell>{deliveryInfo.startDate}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>운송 완료일</TableCell>
                  <TableCell>{deliveryInfo.endDate}</TableCell>
                </TableRow>
                {deliveryInfo.route.map((stop, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {idx === 0
                        ? "상차지"
                        : idx === deliveryInfo.route.length - 1
                        ? "하차지"
                        : "경유지"}
                    </TableCell>
                    <TableCell>
                      {stop.location} ({stop.time})
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>화물명</TableCell>
                  <TableCell>{deliveryInfo.cargoName}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 고객 상세 */}
        <Box my={4}>
          <Box sx={{ borderBottom: "2px solid #ccc", pb: 1, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              고객 상세
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: "#F5F7FA",
              // borderTop: "1px solid #ccc", // 이중 Border 제거
              borderBottom: "1px solid #ccc",
              px: 2,
              py: 2,
            }}
          >
            <Typography mb={1}>이름: {customer.name}</Typography>
            <Typography mb={1}>전화번호: {customer.phone}</Typography>
            <Typography mb={1}>이메일: {customer.email}</Typography>
          </Box>
        </Box>

        {/* 정산 내역 */}
        <Box my={4}>
          <Box sx={{ borderBottom: "2px solid #ccc", pb: 1, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              정산 내역
            </Typography>
          </Box>
          <Box sx={tableStyle}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>기본요금</TableCell>
                  <TableCell>{formatPrice(payment.baseFare)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>주행거리</TableCell>
                  <TableCell>{payment.distance}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>무게</TableCell>
                  <TableCell>{payment.weight}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>수수료</TableCell>
                  <TableCell>{formatPrice(payment.fee)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>프로모션</TableCell>
                  <TableCell>{formatPrice(payment.promotion)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>총계</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {formatPrice(payment.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 입금 은행 안내 */}
        <Box my={4}>
          <Box sx={{ borderBottom: "2px solid #ccc", pb: 1, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              입금 은행 안내
            </Typography>
          </Box>
          <Box sx={tableStyle}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>은행명</TableCell>
                  <TableCell>계좌번호</TableCell>
                  <TableCell>예금주</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{bankInfo.bank}</TableCell>
                  <TableCell>{bankInfo.account}</TableCell>
                  <TableCell>{bankInfo.holder}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* 목록으로 버튼 (하단) */}
        <Box display="flex" justifyContent="center" mt={6}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#113F67",
              color: "#fff",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              "&:hover": { bgcolor: "#0d3050" },
            }}
            onClick={() => navigate("/admin/delivered")}
          >
            목록으로
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default DeliveredDetail;
