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

const SORT_MAP = {
  recent: "RECENT",
  profit: "FEE_DESC",
  "less-waypoint": "WP_ASC",
  "more-waypoint": "WP_DESC",
  "long-distance": "DIST_DESC",
  "short-distance": "DIST_ASC",
};

const ListComponent = () => {
  const { driverId } = useParams();

  const thisTheme = useTheme();

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
            minHeight: 190,
          }}
        >
          <Box pt={4}>
            <CommonTitle>배송 요청</CommonTitle>
          </Box>

          <Grid
            container
            spacing={10}
            justifySelf={"center"}
            justifyContent="center"
            width={"90%"}
            p={4}
          >
            <Grid item sx={{ minWidth: 200 }}>
              <FormControl fullWidth>
                <InputLabel>검색 영역</InputLabel>
                <Select
                  label="검색 영역"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                >
                  <MenuItem value="START">출발 지역</MenuItem>
                  <MenuItem value="END">도착 지역</MenuItem>
                  <MenuItem value="MEMO">요청 설명</MenuItem>
                  <MenuItem value="ALL">모두</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item sx={{ flex: 1, minWidth: 300 }}>
              <TextField
                fullWidth
                placeholder="키워드를 입력하세요"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* 필터 및 검색 */}
        <Grid
          container
          width={"90%"}
          p={4}
          pt={0}
          spacing={10}
          justifySelf={"center"}
          justifyContent={"space-between"}
        >
          {/* 좌측 필터 영역 */}
          <Grid item minWidth={200}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              정렬 기준 선택
            </Typography>

            <Grid item sx={{ mb: 5 }}>
              <FormControl fullWidth variant="standard" size="small">
                <Select
                  value={sortSel}
                  onChange={(e) => setSortSel(e.target.value)}
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

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              시작일 선택
            </Typography>

            <Grid item sx={{ minWidth: 180 }}>
              {/* 간단 시작일 필터: 해당 날짜의 wantToStart 만 */}
              <TextField
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>

            <Grid
              container
              direction={"row"}
              justifyContent={"space-between"}
              mt={2}
            >
              <Grid item>
                <Button variant="contained" onClick={applyFilters}>
                  적용
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={resetFilters}>
                  초기화
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {/* 리스트 영역 */}
          <Grid item sx={{ flex: 1, minWidth: 300 }}>
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
                  기사님께 지명 운송 요청이 {proposals.length}건 도착하였습니다!
                  <Box
                    component="span"
                    sx={{ ml: 1, color: thisTheme.palette.background.default, fontWeight: 700 }}
                  >
                    (클릭하여 확인하기)
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
              justifyContent="space-between"
            >
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
            </Grid>
          </Grid>
        </Grid>
      </Box>
      {dialogOpen && (
        <DriverProposalComponent
          open={dialogOpen}
          proposals={proposals}
          onClose={closeProposalDialog}
        />
      )}
      {loading && (
        <LoadingComponent open={loading} text="요청 목록을 불러오는 중..." />
      )}
    </Box>
  );
};

export default ListComponent;
