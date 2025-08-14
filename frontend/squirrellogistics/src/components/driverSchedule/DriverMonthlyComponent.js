import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box, Button, IconButton, Typography, Dialog,
    DialogTitle, DialogContent, DialogActions,
    MenuItem, Select, FormControl, InputLabel,
    GlobalStyles, Stack,
    Grid,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { ko } from "date-fns/locale";
import {
    addMonths, format, parse, startOfMonth, endOfMonth, isSameDay,
    startOfWeek as dfStartOfWeek, getDay as dfGetDay
} from "date-fns";
import MontlyDetailPopupComponent from "./MontlyDetailPopupComponent";

const RBC_OVERRIDE_STYLE_ID = 'rbc-overrides-inline';

//mui설정 위에 react-big-calendar이 덧입혀지는 상황 수정, 기본 값 전부 제거.
const rbcOverrideCSS = `
.rbc-month-view { border:1px solid #bbc5d0 !important; border-radius:12px; overflow:hidden; }
.rbc-month-row + .rbc-month-row { border-top:1px solid #bbc5d0 !important; }
.rbc-header { border-bottom:1px solid #bbc5d0 !important; padding:8px; font-weight:600; background:#e2e5e7; color:#2A2A2A; }
.rbc-month-view .rbc-row-bg .rbc-day-bg + .rbc-day-bg { border-left:1px solid #bbc5d0 !important; }
.rbc-month-view .rbc-header + .rbc-header { border-left:1px solid #bbc5d0 !important; }`;

//반드시! head 맨 끝에 style 태그를 추가(appendChild).
function useAttachRbcOverrides() {
    React.useEffect(() => {
        let styleEl = document.getElementById(RBC_OVERRIDE_STYLE_ID);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = RBC_OVERRIDE_STYLE_ID;
            styleEl.type = 'text/css';
            styleEl.appendChild(document.createTextNode(rbcOverrideCSS));
            document.head.appendChild(styleEl);
        } else {
            styleEl.textContent = rbcOverrideCSS;
            document.head.appendChild(styleEl);
        }
    }, []);
}

//로케일(언어, 지역) 설정.
const locales = { ko };

//문자열/숫자 => Date 객체로 변환(파싱 오류 막기).
const ensureDate = (d) => (d instanceof Date ? d : new Date(d));

//Big Calendar에 date-fns 연결.
const localizer = dateFnsLocalizer({
    format,
    parse: (str, fmt, refDate) =>
        parse(str, fmt, ensureDate(refDate), { locale: ko }),
    startOfWeek: (date) => dfStartOfWeek(ensureDate(date), { locale: ko }),
    getDay: (date) => dfGetDay(ensureDate(date)),
    locales,
});


//개별 이벤트 클릭시 출력할 더미 이벤트 데이터.
const eventDTO = [
  {
    schedule_id: 2025072500123,
    assigned_id: 2025072500123,
    event_start_at: "2025-08-05",
    event_end_at: "2025-08-05",
    event_type: "transport",
    company_id: 201,
    company_name: "(주) 한빛로지스틱스",
    total_cargo_count: 12,
    total_cargo_weight: 250,
    estimated_fee: 125000,
    distance: 0,
    duration: 0, 
    created_at: new Date(new Date() - 20 * 60 * 1000),
    start_address: "부산광역시 연제구 중앙대로 1001",          // 부산시청
    end_address:   "대구광역시 중구 공평로 88",               // 대구시청 일대
    waypoints: [
      { address: "울산광역시 남구 중앙로 201", order: 1, handling_id: 1 }, // 울산시청
      { address: "경상북도 경주시 양정로 260", order: 2, handling_id: 2 }, // 경주시청
    ],
  },
  {
    schedule_id: 2025072500124,
    assigned_id: 2025072500124,
    event_start_at: "2025-08-08",
    event_end_at: "2025-08-08",
    event_type: "transport",
    company_id: 202,
    company_name: "(주) 코리아익스프레스",
    total_cargo_count: 30,
    total_cargo_weight: 600,
    estimated_fee: 210000,
    distance: 0,
    duration: 0,
    created_at: new Date(new Date() - 5 * 60 * 1000),
    start_address: "인천광역시 남동구 정각로 29",             // 인천시청
    end_address:   "강원특별자치도 춘천시 공지로 280",         // 춘천시청
    waypoints: [
      { address: "경기도 의정부시 시민로 1", order: 1, handling_id: 3 },   // 의정부시청
    ],
  },
  {
    schedule_id: 2025072500125,
    assigned_id: 2025072500125,
    event_start_at: "2025-08-10",
    event_end_at: "2025-08-10",
    event_type: "transport",
    company_id: 203,
    company_name: "(주) 한강트랜스",
    total_cargo_count: 8,
    total_cargo_weight: 180,
    estimated_fee: 87000,
    distance: 0,
    duration: 0,
    created_at: new Date(new Date() - 30 * 60 * 1000),
    start_address: "서울특별시 중구 세종대로 110",                   // 서울시청
    end_address:   "전북특별자치도 전주시 완산구 노송광장로 10",       // 전주시청
    waypoints: [
      { address: "충남 천안시 서북구 번영로 156", order: 1, handling_id: 2 },        // 천안시청
      { address: "전북특별자치도 익산시 인북로32길 1", order: 2, handling_id: 1 },    // 익산시청
    ],
  },
  {
    schedule_id: 2025072500126,
    assigned_id: 2025072500126,
    event_start_at: "2025-08-14",
    event_end_at: "2025-08-16",
    event_type: "transport",
    company_id: 204,
    company_name: "(주) 동서물류",
    total_cargo_count: 50,
    total_cargo_weight: 1200,
    estimated_fee: 350000,
    distance: 0,
    duration: 0,
    created_at: new Date(new Date() - 60 * 60 * 1000),
    start_address: "경기도 수원시 팔달구 효원로 241",           // 수원시청
    end_address:   "경남 창원시 성산구 중앙대로 151",           // 창원시청
    waypoints: [
      { address: "충북 청주시 상당구 상당로 155", order: 1, handling_id: 3 }, // 청주시청
    ],
  },
  {
    schedule_id: 2025072500127,
    assigned_id: 2025072500127,
    event_start_at: "2025-08-19",
    event_end_at: "2025-08-21",
    event_type: "transport",
    company_id: 205,
    company_name: "(주) 글로벌로지스",
    total_cargo_count: 15,
    total_cargo_weight: 320,
    estimated_fee: 145000,
    distance: 0,
    duration: 0,
    created_at: new Date(new Date() - 10 * 60 * 1000),
    start_address: "광주광역시 서구 내방로 111",                // 광주시청
    end_address:   "대전광역시 서구 둔산로 100",                // 대전시청
    waypoints: [
      { address: "전북특별자치도 전주시 완산구 노송광장로 10", order: 1, handling_id: 2 }, // 전주시청
    ],
  },
  {
    schedule_id: 2025072500128,
    assigned_id: 2025072500128,
    event_start_at: "2025-08-03",
    event_end_at: "2025-08-03",
    event_type: "vacation",
  },
  {
    schedule_id: 2025072500129,
    assigned_id: 2025072500129,
    event_start_at: "2025-08-12",
    event_end_at: "2025-08-13",
    event_type: "vacation",
  },
  {
    schedule_id: 2025072500130,
    assigned_id: 2025072500130,
    event_start_at: "2025-08-22",
    event_end_at: "2025-08-24",
    event_type: "vacation",
  },
];

//실데이터 연결 전 더미 데이터 연결: 캘린더에 특정일 이벤트 추가(운송 예약 or 휴가).
function buildCalendarEventsFromDTO(dtos, year, month) {
    const toDate = (ymd, h = 9) => new Date(`${ymd}T${String(h).padStart(2, '0')}:00:00`);
    return dtos
        .filter(e => {
            const s = new Date(e.event_start_at);
            return s.getFullYear() === year && (s.getMonth() + 1) === month;
        })
        .map(e => {
            const isTransport = e.event_type === 'transport';
            const isVacation = e.event_type === 'vacation';
            return {
                title: isTransport ? '운송 예약' : isVacation ? '개인 휴가' : '기타 일정',
                start: toDate(e.event_start_at, 9),
                end: toDate(e.event_end_at, isVacation ? 18 : 18),
                allDay: e.event_start_at !== e.event_end_at,
                type: isTransport ? 'transport' : isVacation ? 'vacation' : 'other',
                schedule_id: e.schedule_id,       // ★ 선택 시 키로 사용
            };
        });
}

//특정 연/월의 첫째 날 반환 함수.
const toYearMonthDate = (y, m) => new Date(y, m - 1, 1);

//숫자를 2자리 문자열 전환 함수.
const pad2 = (n) => String(n).padStart(2, "0");

//이벤트 라벨 표시.
function MonthEvent({ event }) {
    return (
        <Box
            sx={{
                fontSize: 14,
                pt: "2px",
                fontWeight: "bold",
                display: "inline-block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}
            title={event.title}
        >
            {event.title}
        </Box>
    );
}

//DriverMonthlyComponent: 컴포넌트 메인부 시작.
export default function DriverMonthlyComponent() {
    useAttachRbcOverrides();
    const navigate = useNavigate();

    //URL 파라미터 받기 => { driverId, year, month }
    const params = useParams();

    //파라미터가 없으면 현재 날짜 사용하기.
    const initial = useMemo(() => {
        const now = new Date();
        return {
            driverId: params.driverId ?? "99999",
            year: params.year ? Number(params.year) : now.getFullYear(),
            month: params.month ? Number(params.month) : now.getMonth() + 1,
        };
    }, [params.driverId, params.year, params.month]);

    //상태값 감지용 useState변수들.
    const [currentYM, setCurrentYM] = useState({ year: initial.year, month: initial.month });
    const [monthDtos, setMonthDtos] = useState([]);
    const [events, setEvents] = useState([]);
    const [openPicker, setOpenPicker] = useState(false);
    const [pickYear, setPickYear] = useState(initial.year);
    const [pickMonth, setPickMonth] = useState(initial.month);

    //현재 표시 중인 달의 DATE객체.
    const currentDate = useMemo(
        () => toYearMonthDate(currentYM.year, currentYM.month),
        [currentYM]
    );

    //캘린더의 기사 일정 이벤트 마커 추가 => setEvents로 start와 end지정.
    const loadEvents = useCallback(async () => {
        const dtos = eventDTO; // 더미
        setMonthDtos(dtos);

        const data = await buildCalendarEventsFromDTO(dtos, currentYM.year, currentYM.month);
        setEvents(
            data.map((e) => ({
                ...e,
                start: ensureDate(e.start),
                end: e.allDay
                    ? new Date(e.end.getFullYear(), e.end.getMonth(), e.end.getDate(), 23, 59, 59)
                    : ensureDate(e.end),
            }))
        );
    }, [initial.driverId, currentYM.year, currentYM.month]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    //URL주소 동기화 => 사용자가 년/월 지정하면 URL변경 후 네비게이트.
    useEffect(() => {
        navigate(`/driver/${initial.driverId}/calendar/${currentYM.year}/${pad2(currentYM.month)}`, { replace: true });
    }, [currentYM, initial.driverId, navigate]);

    //이전달, 다음달 이동 버튼 클릭 함수 => currentDate +1 혹은 -1.
    const goPrev = () => {
        const d = addMonths(currentDate, -1);
        setCurrentYM({ year: d.getFullYear(), month: d.getMonth() + 1 });
    };
    const goNext = () => {
        const d = addMonths(currentDate, 1);
        setCurrentYM({ year: d.getFullYear(), month: d.getMonth() + 1 });
    };

    //우측 상단 선택된 년/월 출력 라벨.
    const titleLabel = useMemo(() => `${currentYM.year}년 ${currentYM.month}월`, [currentYM]);

    const eventPropGetter = useCallback((event) => {
        const isVacation = event.type === "vacation";
        return {
            style: {
                backgroundColor: isVacation ? "#E0E6ED" : "#113F67",
                color: isVacation ? "#344f59" : "#fff",
                border: `1px solid ${isVacation ? "#c1cbd7" : "#051829"}`,
                borderRadius: 999,
                lineHeight: 1.2,
                paddingTop: 2,
                paddingBottom: 2,
            }
        };
    }, []);

    //[오늘]을 굵게 표시 => 진한 남색 배경, 아웃라인(임시 스타일).
    const dayPropGetter = useCallback((date) => {
        if (isSameDay(date, new Date())) {
            return {
                className: "rbc-today-custom",
                style: { outline: "2px solid #113F67", outlineOffset: "-2px", background: "rgba(25, 118, 210, 0.06)" },
            };
        }
        return {};
    }, []);

    //이번달 첫일과 막일 제한.
    const min = startOfMonth(currentDate);
    const max = endOfMonth(currentDate);

    //년/월 선택 팝업 오픈 핸들러.
    const handleOpenPicker = () => {
        setPickYear(currentYM.year);
        setPickMonth(currentYM.month);
        setOpenPicker(true);
    };
    const handleApplyPicker = () => {
        setCurrentYM({ year: pickYear, month: pickMonth });
        setOpenPicker(false);
    };

    //---------- 개별 이벤트 클릭 팝업 핸들러 ----------.
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDto, setSelectedDto] = useState(null);

    const dtoById = useMemo(() => {
        const m = new Map();
        for (const d of monthDtos) m.set(String(d.schedule_id), d);
        return m;
    }, [monthDtos]);

    // 캘린더 이벤트 클릭
    const handleSelectEvent = useCallback((ev) => {
        const dto = dtoById.get(String(ev.schedule_id));
        if(dto.event_type === 'vacation'){
            return;
        }
        setSelectedDto(dto ?? null);
        setDialogOpen(true);
    }, [dtoById]);

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setSelectedDto(null);
    }, []);

    //년/월 선택 팝업 제한 => 연도는 현재 2025 -3 ~ +3(대충 서비스 시작 기간부터 최대 예약 가능 기간).
    const years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    //렌더링 리턴문.
    return (
        <Box width={"100%"} justifyItems={"center"}>

            <GlobalStyles styles={{
                ".rbc-calendar": { background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", width: "90%" },
                '.rbc-toolbar': { display: 'none !important' },
                ".rbc-month-view": { border: "1px solid #bbc5d0", borderRadius: 12, overflow: "hidden" },
                ".rbc-month-row + .rbc-month-row": { borderTop: "1px solid #bbc5d0" },
                ".rbc-header": { borderBottom: "1px solid #bbc5d0", padding: 8, fontWeight: 600, background: "#e2e5e7", color: '#2A2A2A', },
                ".rbc-date-cell": { padding: 8 },
                ".rbc-off-range-bg": { background: "#fafafa" },
                ".rbc-event, .rbc-event-allday": {
                    boxShadow: "none",
                    border: "none",
                    borderRadius: 999,
                    padding: 0,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                },
                ".rbc-today": { background: "transparent" },
                ".rbc-row-segment": { display: "flex", alignItems: "flex-end" },
                ".rbc-month-view .rbc-row-bg .rbc-day-bg + .rbc-day-bg": {
                    borderLeft: "1px solid #bbc5d0 !important",
                },

                ".rbc-month-view .rbc-header + .rbc-header": {
                    borderLeft: "1px solid #bbc5d0 !important",
                },
            }} />


            <Grid width={"100%"} justifyItems={"center"}
                sx={{
                    background: "linear-gradient(to bottom, #58a1c85d 0%, white 100%)",
                    minHeight: 160
                }}
            >
                <Typography variant="h4" align="center" pt={4} gutterBottom
                    sx={{
                        fontFamily: 'inherit', fontSize: '2.0rem',
                        fontWeight: 'bold',
                        color: '#2A2A2A',
                        margin: 0
                    }}>월별 일정표
                </Typography>
                <Grid container direction="row" alignItems="center" justifyContent={"space-between"} width={"90%"} pt={2}>
                    <Grid container direction="row" spacing={1} alignSelf={"flex-start"}>
                        <Button variant="outlined" startIcon={<ChevronLeftIcon />}
                            sx={{ color: "#113F67", backgroundColor: "white", borderColor: "#113F67" }} onClick={goPrev}>지난달</Button>
                        <Button variant="outlined" endIcon={<ChevronRightIcon />}
                            sx={{ color: "#113F67", backgroundColor: "white", borderColor: "#113F67" }} onClick={goNext}>다음달</Button>
                    </Grid>
                    <Grid container direction="row" spacing={1} alignItems="center">
                        <Typography variant="h3" align="center"
                            sx={{
                                fontFamily: 'inherit', fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: '#113F67',
                                margin: 0
                            }}>{titleLabel}
                        </Typography>
                        <IconButton aria-label="월 선택" onClick={handleOpenPicker}>
                            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>

            {/* 메인 캘린더 */}
            <Calendar
                toolbar={false}
                localizer={localizer}
                width={"90%"}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="month"
                date={currentDate}
                views={["month"]}
                style={{ height: "calc(100vh - 240px)" }}
                messages={{
                    next: "다음", previous: "이전", today: "오늘",
                    month: "월", week: "주", day: "일", date: "날짜", time: "시간", event: "일정",
                    showMore: (total) => `+${total} 더보기`,
                }}
                eventPropGetter={eventPropGetter}
                dayPropGetter={dayPropGetter}
                components={{ month: { event: MonthEvent } }}
                onSelectEvent={handleSelectEvent}
                min={min}
                max={max}
                popup
            />

            {/* 모달 */}
            {dialogOpen && (
                <MontlyDetailPopupComponent
                driverId={initial.driverId}
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    event={selectedDto}   // 혹은 selectedEvent
                />
            )}

            <Dialog open={openPicker} onClose={() => setOpenPicker(false)}>
                <DialogTitle textAlign={"center"}>연도 / 월 선택</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={20} sm={12}>
                            <FormControl fullWidth>
                                <InputLabel id="year-label" sx={{ backgroundColor: "white" }}>연도</InputLabel>
                                <Select
                                    labelId="year-label"
                                    value={pickYear}
                                    onChange={(e) => setPickYear(e.target.value)}
                                >
                                    {years.map((y) => (<MenuItem key={y} value={y}>{y}년</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={20} sm={8}>
                            <FormControl fullWidth>
                                <InputLabel id="month-label" sx={{ backgroundColor: "white" }}>월</InputLabel>
                                <Select
                                    labelId="month-label"
                                    value={pickMonth}
                                    onChange={(e) => setPickMonth(e.target.value)}
                                >
                                    {months.map((m) => (<MenuItem key={m} value={m}>{m}월</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: "space-between" }} >
                    <Button variant="outlined" onClick={() => setOpenPicker(false)}>취소</Button>
                    <Button variant="contained" onClick={handleApplyPicker}>적용</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}