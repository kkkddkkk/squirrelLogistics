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
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useNavigate } from "react-router-dom";
import DeliveryRouteMap from "../../components/driver/DeliveryRouteMap";

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
    mountainous: 5000,
    caution: 2000,
    fee: 3000,
    promotion: -5000,
    "actual-fee": 70000 + 5000 + 2000 + 3000 - 5000,
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

  const handleIconClick = () => {
    navigate("/admin/Support/Policy/PolicyPage");
  };

  return (
    <Box sx={{ bgcolor: "#F5F7FA", py: 6 }}>
      <Container maxWidth="lg">
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
              운송 내역
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 3 }}>
            {/* 왼쪽: 일정 */}
            <Box
              sx={{
                width: "50%",
                backgroundColor: "#F5F7FA",
                borderRadius: 2,
                px: 2,
                py: 1,
              }}
            >
              {[
                { label: "운송 ID", value: deliveryInfo.id },
                { label: "운송 시작일", value: deliveryInfo.startDate },
                { label: "운송 완료일", value: deliveryInfo.endDate },
                {
                  label: "상차지",
                  value: `${deliveryInfo.route[0].location} (${deliveryInfo.route[0].time})`,
                },
                ...(deliveryInfo.route.length === 3
                  ? [
                      {
                        label: "경유지",
                        value: `${deliveryInfo.route[1].location} (${deliveryInfo.route[1].time})`,
                      },
                    ]
                  : []),
                {
                  label: "하차지",
                  value: `${
                    deliveryInfo.route[deliveryInfo.route.length - 1].location
                  } (${
                    deliveryInfo.route[deliveryInfo.route.length - 1].time
                  })`,
                },
                { label: "화물명", value: deliveryInfo.cargoName },
                {
                  label: "",
                  value: (
                    <Typography
                      sx={{
                        fontSize: "0.95rem",
                        color: "#d45d55ff",
                        textAlign: "right",
                        width: "100%",
                        pr: 0.1,
                        mt: 1.0,
                        fontWeight: "medium",
                      }}
                    >
                      지도를 확대하거나 축소해서 경로를 확인해보세요.
                    </Typography>
                  ),
                },
              ].map((item, idx, arr) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "1rem",
                    lineHeight: 1.5,
                    px: 2,
                    py: 2,
                    borderBottom:
                      idx !== arr.length - 1 ? "1px solid #ccc" : "none",
                  }}
                >
                  <Typography sx={{ fontWeight: 500 }}>{item.label}</Typography>
                  <Typography>{item.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* 오른쪽: 지도 */}
            <Box
              sx={{
                width: "50%",
                height: 500,
                border: "1px solid #ccc",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <DeliveryRouteMap
                locations={deliveryInfo.route.map((r) => r.location)}
              />
            </Box>
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
                  <TableCell>산간지역</TableCell>
                  <TableCell>{formatPrice(payment.mountainous)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>취급주의</TableCell>
                  <TableCell>{formatPrice(payment.caution)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      수수료
                      <IconButton
                        onClick={handleIconClick}
                        size="small"
                        sx={{ ml: 0.5 }}
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>{formatPrice(payment.fee)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      프로모션
                      <IconButton
                        onClick={handleIconClick}
                        size="small"
                        sx={{ ml: 0.5 }}
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>{formatPrice(payment.promotion)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>총계</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    {formatPrice(payment["actual-fee"])}
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

        {/* 목록으로 버튼 */}
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
