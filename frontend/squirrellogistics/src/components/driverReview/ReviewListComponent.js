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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { fetchDriverReviews } from "../../api/deliveryRequest/deliveryAssignmentAPI";
import { useParams } from "react-router-dom";
import ReviewItemComponent from "./ReviewItemComponent";
import LoadingComponent from "../common/LoadingComponent";
import { CommonTitle } from "../common/CommonText";
import { theme } from "../common/CommonTheme";


export default function ReviewListComponent() {
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());
  const thisTheme = useTheme();
  const isSmaller900 = useMediaQuery(thisTheme.breakpoints.down('md'));

  //DB데이터 연동.
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr("");
        let res = await fetchDriverReviews(
          { page: page - 1, size },
          { signal: ctrl.signal }
        );

        console.log("review: " + res);

        setData(res);
        setExpanded(new Set());
      } catch (e) {
        setErr("리뷰를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [page, size]);

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

  console.log("loading: " + loading);
  return (
    <>
      <Box pt={isSmaller900 ? 2 : 4}>
        <CommonTitle>사용자 리뷰</CommonTitle>
      </Box>
      <Grid container>
        <Grid size={isSmaller900 ? 0 : 3} />
        <Grid size={isSmaller900 ? 12 : 6} mt={isSmaller900 ? 2 : 0} mb={2}>
          <Box>
            {/* 정렬/페이지크기 선택 */}
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              spacing={2}
              sx={{ px: 4, }}
            >
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel
                  id="size-label"
                  sx={{
                    backgroundColor: thisTheme.palette.background.default,
                    color: thisTheme.palette.text.secondary,
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
                    backgroundColor: thisTheme.palette.background.default,
                    color: thisTheme.palette.text.secondary,
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
            <Box sx={{ bgcolor: thisTheme.palette.background.default, py: 4 }}>
              <Stack direction="row" spacing={1.5} justifyContent="center">
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  sx={{
                    borderColor: thisTheme.palette.primary.main,
                    color: thisTheme.palette.primary.main,
                    "&:hover": {
                      borderColor: thisTheme.palette.primary.main,
                      bgcolor: thisTheme.palette.primary.light,
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
                      borderColor: thisTheme.palette.primary.main,
                      color: pn === page ? "white" : thisTheme.palette.primary.main,
                      bgcolor:
                        pn === page ? thisTheme.palette.primary.main : "transparent",
                      "&:hover": {
                        borderColor: thisTheme.palette.primary.main,
                        bgcolor:
                          pn === page
                            ? thisTheme.palette.primary.main
                            : thisTheme.palette.primary.light,
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
                    borderColor: thisTheme.palette.primary.main,
                    color: thisTheme.palette.primary.main,
                    "&:hover": {
                      borderColor: thisTheme.palette.primary.main,
                      bgcolor: thisTheme.palette.primary.light,
                    },
                  }}
                >
                  다음
                </Button>
              </Stack>
            </Box>
          )}

          {/* 로딩 모달 */}
          {loading && <LoadingComponent open={loading} text="리뷰 목록을 불러오는 중..." />}
        </Grid>
        <Grid size={isSmaller900 ? 0 : 3} />
      </Grid>

    </>

  );
}
