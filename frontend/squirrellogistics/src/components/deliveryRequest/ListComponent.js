import {
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  Pagination,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DeliveryCard from "./DeliveryCard";
import LoadingComponent from "../common/LoadingComponent";
import { fetchDeliveryRequests } from "../../api/deliveryRequest/deliveryRequestAPI";
import { fetchDeliveryProposals } from "../../api/deliveryRequest/deliveryProposalAPI";
import DriverProposalComponent from "./DriverProposalComponent";
import DatePicker from "react-datepicker";
import TwoButtonPopupComponent from './TwoButtonPopupComponent';
import OneButtonPopupComponent from './OneButtonPopupComponent';
import { CommonTitle } from "../common/CommonText";
import { theme } from "../common/CommonTheme";
import logo from "../../components/common/squirrelLogisticsLogo.png";
import darkLogo from "../../components/common/squirrelLogisticsLogo_dark.png";

const SORT_MAP = {
  recent: "RECENT",
  profit: "FEE_DESC",
  "less-waypoint": "WP_ASC",
  "more-waypoint": "WP_DESC",
  "long-distance": "DIST_DESC",
  "short-distance": "DIST_ASC",
};
export const FONT_SIZE = "clamp(12px, 1.5vw, 14px)";
const ListComponent = () => {
  const { driverId } = useParams();

  const thisTheme = useTheme();
  const isSmaller900 = useMediaQuery(thisTheme.breakpoints.down('md'));
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // proposals 토스트용
  const [proposals, setProposals] = useState([]);
  const [openToast, setOpenToast] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errpopupOpen, setErrpopupOpen] = useState(false);
  const navigate = useNavigate();
  // 페이지, 필터용
  const [pageReq, setPageReq] = useState({
    page: 1,
    size: 10,
    sort: "createAt",
    dir: "DESC",
    q: "",
    scope: "",
    startDate: "",
    sortKey: "RECENT",
  });

  // 페이지 및 필터관련 입력값 감지용.
  const [q, setQ] = useState("");
  const [scope, setScope] = useState("");
  const [startDate, setStartDate] = useState("");
  const [sortSel, setSortSel] = useState("recent");

  //백엔드 목록 데이터 로딩.
  useEffect(() => {
    setLoading(true);
    setErr(null);
    fetchDeliveryRequests(pageReq)
      .then(setPageData)
      .catch(e => {
        const errBody = e.response?.data;
        setErr(errBody?.message ?? e.message);
        setErrpopupOpen(true);
      })
      .finally(() => setLoading(false));
  }, [pageReq]);


  //날짜 필터 적용 이벤트 핸들러.
  const applyFilters = () => {
    setPageReq((prev) => ({
      ...prev,
      page: 1,
      q: q?.trim() || "",
      scope: scope || "",
      startDate: startDate || "",
      sortKey: SORT_MAP[sortSel] || "RECENT",
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //날짜 필터 초기화 이벤트 핸들러.
  const resetFilters = () => {
    setQ("");
    setScope("");
    setStartDate("");
    setSortSel("recent");
    setPageReq((prev) => ({
      ...prev,
      page: 1,
      q: "",
      scope: "",
      startDate: "",
      sortKey: "RECENT",
    }));
  };

  // 지명 제안 조회 + 토스트 열기
  useEffect(() => {
    const ctrl = new AbortController();
    fetchDeliveryProposals({ signal: ctrl.signal })
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setProposals(arr);

        if (arr.length > 0) {
          setOpenToast(true);
        }
      })
      .catch(e => {
        const errBody = e.response?.data;
        setErr(errBody?.message ?? e.message);
        setErrpopupOpen(true);
      })

    return () => ctrl.abort();
  }, [driverId]);

  // if (loading && !pageData) {
  //   return <LoadingComponent open text="요청 목록을 불러오는 중..." />;
  // }
  if (err) {
    const mess = (
      <>
        {String(err)}
        <br />
        [확인] 클릭 시, 메인 화면으로 이동합니다.
      </>
    );
    return (
      <OneButtonPopupComponent
        open={errpopupOpen}
        onClick={() => {
          setErrpopupOpen(false);
          navigate("/");
        }}
        title={"올바르지 않은 접근"}
        content={mess}
      />
    );
  }
  //if (!pageData) return null;

  const dtoList = pageData?.dtoList ?? [];
  const totalPage = Math.max(pageData?.totalPage ?? 1, 1);
  const current = Math.max(pageData?.current ?? 1, 1);
  const firstLoad = !pageData; // 최초 로딩 여부

  //const { dtoList, totalPage, current } = pageData;

  const openProposalDialog = () => {
    setDialogOpen(true);
  };

  const closeProposalDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Box width={"100%"}>
      <Box width={"100%"}>
        <Grid
          sx={{
            bgcolor: thisTheme.palette.background.default,
          }}
        >
          <Box pt={isSmaller900 ? 2 : 4}>
            <CommonTitle>배송 요청</CommonTitle>
          </Box>

          {!isSmaller900 && (

            <Grid
              container
              spacing={isSmaller900 ? 2 : 10}
              justifySelf={"center"}
              sx={{ mx: "auto" }}
              justifyContent="center"
              width={"80%"}
              mt={2}
            >

              <Grid item sx={{ minWidth: isSmaller900 ? "40%" : 200 }}>
                <FormControl fullWidth size={isSmaller900 ? "small" : "medium"}>
                  <InputLabel>{isSmaller900 ? '항목' : '검색 영역'}</InputLabel>
                  <Select
                    label={isSmaller900 ? '항목' : '검색 영역'}
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    sx={{
                      fontSize: FONT_SIZE,
                      '& .MuiSelect-select': { fontSize: FONT_SIZE },
                      '& .MuiOutlinedInput-input': { fontSize: FONT_SIZE },
                    }}
                  >
                    <MenuItem value="START">출발 지역</MenuItem>
                    <MenuItem value="END">도착 지역</MenuItem>
                    <MenuItem value="MEMO">요청 설명</MenuItem>
                    <MenuItem value="ALL">모두</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item sx={{ flex: 1, minWidth: isSmaller900 ? "50%" : 300 }}>
                <TextField
                  fullWidth
                  placeholder="키워드를 입력하세요"
                  sx={{
                    '& .MuiOutlinedInput-input': { fontSize: FONT_SIZE },
                  }}
                  value={q}
                  size={isSmaller900 ? "small" : "medium"}
                  onChange={(e) => setQ(e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* 필터 및 검색 */}
        <Grid
          container
          width={"80%"}
          spacing={isSmaller900 ? 2 : 10}
          justifySelf={"center"}
          sx={{ mx: "auto" }}
          justifyContent={"center"}
          alignContent={"center"}
        >
          {/* 좌측 필터 영역 */}
          <Grid
            container
            direction={isSmaller900 ? "row" : "column"}
            justifyContent="flex-start"
            item
            xs={12}
            md="auto"
            alignItems="flex-start"
            wrap="nowrap"
            sx={{ width: { xs: "100%", md: 200 }, gap: 1 }}
            mb={isSmaller900 ? 0 : 2}
            mt={isSmaller900 ? 2 : 0}
          >

            <Grid
              container
              direction={isSmaller900 ? "row" : "column"}
              alignContent={"center"}
              mt={isSmaller900 ? 0 : 2}
              minWidth={isSmaller900 ? "20%" : 200}
              wrap="nowrap"
              rowGap={1}
            >

              <Grid item>
                {!isSmaller900 && (
                  <Typography variant="subtitle1" sx={{ mb: isSmaller900 ? 0 : 1, fontSize: FONT_SIZE }}>
                    정렬 기준 선택
                  </Typography>
                )}
                <FormControl fullWidth variant="standard" size="small">
                  <Select
                    value={sortSel}
                    onChange={(e) => setSortSel(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': { fontSize: FONT_SIZE },
                    }}
                  >
                    <MenuItem value="recent">최신 등록 순</MenuItem>
                    <MenuItem value="profit">수익 높은 순</MenuItem>
                    <MenuItem value="less-waypoint">경유지 적은 순</MenuItem>
                    <MenuItem value="more-waypoint">경유지 많은 순</MenuItem>
                    <MenuItem value="long-distance">거리 긴 순</MenuItem>
                    <MenuItem value="short-distance">거리 짧은 순</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {!isSmaller900 && (

                <Grid item>
                  <Typography variant="subtitle1" sx={{ mb: isSmaller900 ? 0 : 1, fontSize: FONT_SIZE }}>
                    시작일 선택
                  </Typography>
                  {/* 간단 시작일 필터: 해당 날짜의 wantToStart 만 */}
                  <TextField
                    fullWidth
                    type="date"
                    size={isSmaller900 ? "small" : "medium"}
                    sx={{
                      '& .MuiOutlinedInput-input': { fontSize: FONT_SIZE },
                    }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Grid>
              )}
            </Grid>

            <Grid
              container
              direction="row"
              justifyContent={{ xs: "flex-end", md: "space-between" }}
              alignItems="center"
              columnGap={1}
              rowGap={1}
              mt={isSmaller900 ? 0 : 2}
              wrap={isSmaller900 ? "wrap" : "nowrap"}
              sx={{ width: { xs: '100%', md: 200 } }}
            >
              <Grid item xs={12} md="auto">
                <Button
                  variant="contained"
                  onClick={applyFilters}
                  size={isSmaller900 ? "small" : "medium"}
                  fullWidth={isSmaller900}
                  sx={{ minWidth: 0, px: 1.5 }}
                >
                  적용
                </Button>
              </Grid>

              <Grid item xs={12} md="auto">
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                  size={isSmaller900 ? "small" : "medium"}
                  fullWidth={isSmaller900}
                  sx={{ minWidth: 0, px: 1.5 }}
                >
                  초기화
                </Button>
              </Grid>
            </Grid>

          </Grid>

          {/* 리스트 영역 */}
          <Grid item sx={{ flex: 1, minWidth: isSmaller900 ? 100 : 300 }}
            mt={isSmaller900 ? 0 : 2}
            mb={isSmaller900 ? 2 : 0}
          >
            {/* 운전자 지명 제안 도착 */}
            {openToast ? (
              <Paper
                onClick={openProposalDialog}
                sx={{
                  p: 1,
                  pl: 2,
                  mb: 2,
                  border: "1px solid #2a2a2a5d",
                  boxShadow: "0px 5px 8px rgba(0, 0, 0, 0.1)",
                  borderRadius: 1.5,
                  fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                  bgcolor: thisTheme.palette.primary.main,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Spoqa Han Sans Neo, Montserrat, sans-serif",
                    color: thisTheme.palette.background.default,
                    fontSize: "clamp(12px, 1.5vw, 14px)",
                  }}
                >
                  <Box
                    component="span"
                    sx={{ color: thisTheme.palette.error.main, fontWeight: 700, mr: 1 }}
                  >
                    [알림]
                  </Box>{" "}
                  {isSmaller900 ? `지명 요청 ${proposals.length}건 도착!` : `기사님께 지명 운송 요청이 ${proposals.length}건 도착하였습니다!`}
                  <Box
                    component="span"
                    sx={{ ml: 1, color: thisTheme.palette.background.default, fontWeight: 700 }}
                  >
                    {isSmaller900 ? '(클릭 이동)' : '(클릭하여 확인하기)'}
                  </Box>{" "}
                </Typography>
              </Paper>
            ) : (
              <></>
            )}

            <Grid
              container
              width="100%"
              spacing={2}
              justifyContent={dtoList.length === 0 ? "center" : "space-between"}
              minHeight={isSmaller900 ? 200 : 300}
            >
              {dtoList.length === 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  mt={isSmaller900 ? 4 : 0}
                >
                  <img
                    src={thisTheme.palette.mode === "light" ? logo : darkLogo}
                    alt="logo"
                    style={{ maxWidth: isSmaller900 ? "120px" : "200px", marginBottom: "20px" }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: thisTheme.palette.text.secondary,
                      fontSize: "clamp(14px, 1.5vw, 16px)",
                      textAlign: "center",
                      fontWeight: "bold",
                      lineHeight: 1.6,
                      mb: 3,
                    }}
                  >
                    아직 등록된 운송 요청이 없습니다.
                  </Typography>
                </Box>
              ) : (

                <Grid item width="100%">
                  {dtoList.map((item, idx) => (
                    <DeliveryCard key={item.requestId} item={item} />
                  ))}

                  <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                      page={current}
                      count={totalPage}
                      onChange={(_, value) => {
                        if (value !== pageReq.page) {
                          setPageReq((prev) => ({ ...prev, page: value }));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      shape="rounded"
                      showFirstButton
                      showLastButton
                      siblingCount={1}
                      boundaryCount={1}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
      {dialogOpen && (
        <DriverProposalComponent
          open={dialogOpen}
          proposals={proposals}
          onClose={closeProposalDialog}
          isMobile={isSmaller900}
        />
      )}
      {loading && (
        <LoadingComponent open={loading} text="요청 목록을 불러오는 중..." />
      )}
    </Box>
  );
};

export default ListComponent;
