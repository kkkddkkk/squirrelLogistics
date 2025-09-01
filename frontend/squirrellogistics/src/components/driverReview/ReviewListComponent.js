import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Rating,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Collapse,
} from "@mui/material";
import { fetchDriverReviews } from "../../api/deliveryRequest/deliveryAssignmentAPI";
import { useParams } from "react-router-dom";
import ReviewItemComponent from "./ReviewItemComponent";
import LoadingComponent from "../common/LoadingComponent";
import { CommonTitle } from "../common/CommonText";
import { theme } from "../common/CommonTheme";

const makeFallbackPage = (driverId, size) => {
  const content = [
    {
      reviewId: 101,
      rating: 4,
      reason:
        "유리 화병 80개 모두 손상 없이 배송 완료 확인했습니다. 사전에 전화로 주의사항 확인해주셔서 좋았어요. 감사합니다!",
      regDate: "2025-08-01 10:12:00",
      modiDate: null,
      stateEnum: "SUBMITTED",
      assignedId: 9001,
      driverId: Number(driverId) || 1,
      driverName: "샘플 기사",
      companyId: 1,
    },
    {
      reviewId: 102,
      rating: 5,
      reason: "정확하고 친절한 응대 감사합니다. 다음에도 부탁드릴게요.",
      regDate: "2025-07-28 09:00:00",
      modiDate: null,
      stateEnum: "SUBMITTED",
      assignedId: 9002,
      driverId: Number(driverId) || 1,
      driverName: "샘플 기사",
      companyId: 2,
    },
  ];

  return {
    content,
    number: 0, // 현재 페이지(0-based)
    size, // 페이지 크기
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
};

export default function ReviewListComponent() {
  const { driverId } = useParams();
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());

  //DB데이터 연동.
  useEffect(() => {
    if (!driverId) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        let res = await fetchDriverReviews(
          driverId,
          { page: page - 1, size },
          { signal: ctrl.signal }
        );

        // content가 비었으면 더미 페이지 세팅
        if (!res || !Array.isArray(res.content) || res.content.length === 0) {
          res = makeFallbackPage(driverId, size);
        }
        setData(res);
        setExpanded(new Set());
      } catch (e) {
        setErr("리뷰를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [driverId, page, size]);

  const content = useMemo(() => {
    const arr = data?.content ?? [];
    switch (sort) {
      case "ratingDesc":
        return [...arr].sort(
          (a, b) =>
            (b.rating ?? 0) - (a.rating ?? 0) ||
            new Date(b.regDate) - new Date(a.regDate)
        );
      case "ratingAsc":
        return [...arr].sort(
          (a, b) =>
            (a.rating ?? 0) - (b.rating ?? 0) ||
            new Date(b.regDate) - new Date(a.regDate)
        );
      case "latest":
      default:
        return [...arr].sort(
          (a, b) => new Date(b.regDate) - new Date(a.regDate)
        );
    }
  }, [data, sort]);

  const totalPages = data?.totalPages ?? 0;

  const toggle = (id) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{ bgcolor: theme.palette.background.paper, minHeight: 160, py: 4 }}
      >
        <CommonTitle>사용자 리뷰</CommonTitle>

        {/* 정렬/페이지크기 선택 */}
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
          sx={{ px: 4, pb: 2 }}
        >
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel
              id="size-label"
              sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.secondary,
              }}
            >
              페이지 크기
            </InputLabel>
            <Select
              labelId="size-label"
              value={size}
              label="페이지 크기"
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              sx={{
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {[5, 10, 20].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}개
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel
              id="sort-label"
              sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.secondary,
              }}
            >
              정렬
            </InputLabel>
            <Select
              labelId="sort-label"
              value={sort}
              label="정렬"
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              sx={{
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              <MenuItem value="latest">최신 등록</MenuItem>
              <MenuItem value="ratingDesc">별점 높은 순</MenuItem>
              <MenuItem value="ratingAsc">별점 낮은 순</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* 에러 메시지 */}
      {err && (
        <Typography color="error" align="center" sx={{ mt: 2 }}>
          {err}
        </Typography>
      )}

      {/* 리스트 */}
      <Box sx={{ maxWidth: "lg", mx: "auto", px: 3, py: 4 }}>
        <Grid container direction="column" spacing={2}>
          {(content ?? []).map((r) => (
            <Grid item key={r.reviewId}>
              <ReviewItemComponent
                review={r}
                expanded={expanded.has(r.reviewId)}
                onToggle={() => toggle(r.reviewId)}
              />
            </Grid>
          ))}
          {!loading && (content ?? []).length === 0 && (
            <Grid item>
              <Typography
                align="center"
                sx={{
                  color: theme.palette.text.secondary,
                  py: 6,
                  fontSize: "1.1rem",
                }}
              >
                표시할 리뷰가 없습니다.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* 페이지네이션(간단 버튼) */}
      {totalPages > 0 && (
        <Box sx={{ bgcolor: theme.palette.background.default, py: 4 }}>
          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button
              variant="outlined"
              size="small"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: theme.palette.primary.light,
                },
              }}
            >
              이전
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pn) => (
              <Button
                key={pn}
                size="small"
                variant={pn === page ? "contained" : "outlined"}
                onClick={() => setPage(pn)}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: pn === page ? "white" : theme.palette.primary.main,
                  bgcolor:
                    pn === page ? theme.palette.primary.main : "transparent",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor:
                      pn === page
                        ? theme.palette.primary.main
                        : theme.palette.primary.light,
                  },
                }}
              >
                {pn}
              </Button>
            ))}
            <Button
              variant="outlined"
              size="small"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: theme.palette.primary.light,
                },
              }}
            >
              다음
            </Button>
          </Stack>
        </Box>
      )}

      {/* 로딩 모달 */}
      {loading && <LoadingComponent />}
    </Box>
  );
}
