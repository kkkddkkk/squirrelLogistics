import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    Stack,
    Typography,
    Card,
    CardContent,
} from "@mui/material";

/** ● 작은 불릿 한 줄 */
function FeatureLine({ text }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />
            <Typography variant="body2" color="text.secondary">{text}</Typography>
        </Stack>
    );
}

/**
 * ● 고정 2열 섹션 (반응형/브레이크포인트/그리드 전부 X)
 *   - 항상 가로 배치
 *   - reverse=true면 "텍스트 | 이미지" 순서
 *   - 이미지 폭 고정(360px), 텍스트는 나머지 영역을 차지
 */
function FeatureRow({
    reverse = false,
    img,
    alt,
    badge,
    title,
    desc,
    bullets = [],
    primary,
    secondary,
}) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: reverse ? "row-reverse" : "row",
                alignItems: "center",
                gap: 4,
                mb: 10,
                // 한 줄 강제 (화면이 좁아져도 줄바꿈 안 함)
                whiteSpace: "normal",
            }}
        >
            {/* 이미지 고정 폭 */}
            <Box
                component="img"
                src={img}
                alt={alt}
                sx={{
                    flex: "0 0 360px",
                    width: 360,
                    height: "auto",
                    borderRadius: 3,
                    boxShadow: 3,
                    display: "block",
                }}
            />

            {/* 텍스트 영역 */}
            <Box sx={{ flex: "1 1 0" }}>
                <Stack spacing={2}>
                    {badge && (
                        <Chip label={badge} color="primary" variant="outlined" sx={{ alignSelf: "flex-start" }} />
                    )}
                    <Typography variant="h4" fontWeight={800}>{title}</Typography>
                    <Typography color="text.secondary">{desc}</Typography>

                    {!!bullets.length && (
                        <Stack spacing={1} sx={{ mt: 1 }}>
                            {bullets.map((t, i) => <FeatureLine key={i} text={t} />)}
                        </Stack>
                    )}

                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        {primary && <Button variant="contained" href={primary.href}>{primary.label}</Button>}
                        {secondary && <Button variant="text" href={secondary.href}>{secondary.label}</Button>}
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}

export default function HomeLanding() {
    return (
        <Box component="main" sx={{ bgcolor: "background.default" }}>
            {/* HERO (원하시면 삭제 가능) */}
            <Box
                sx={{
                    py: 8,
                    background:
                        "radial-gradient(1200px 500px at 80% 0%, #e8f3ff 0%, transparent 60%), linear-gradient(180deg, #f7fbff 0%, #ffffff 100%)",
                    mb: 6,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Box sx={{ flex: "1 1 0" }}>
                            <Stack spacing={2}>
                                <Chip label="물류 중개 플랫폼" color="primary" variant="outlined" sx={{ alignSelf: "flex-start" }} />
                                <Typography variant="h3" fontWeight={800} lineHeight={1.2}>
                                    즉시 견적부터 예약·정산까지
                                    <br />하나의 플랫폼에서.
                                </Typography>
                                <Typography color="text.secondary">
                                    실시간 커뮤니케이션과 직관적인 대시보드로 복잡한 물류를 간편하게.
                                    다람로지틱스에서 빠르고 정확하게 처리하세요.
                                </Typography>
                                <Stack direction="row" spacing={2} mt={1}>
                                    <Button variant="contained" size="large" href="/register">지금 시작하기</Button>
                                    <Button variant="outlined" size="large" href="/estimate">견적 받아보기</Button>
                                </Stack>
                                <Stack direction="row" spacing={4} mt={3}>
                                    {[
                                        { k: "등록 기사", v: "4,300+" },
                                        { k: "기업 고객", v: "1,200+" },
                                        { k: "월간 배송", v: "85,000+" },
                                    ].map((s) => (
                                        <Box key={s.k}>
                                            <Typography fontWeight={800}>{s.v}</Typography>
                                            <Typography variant="body2" color="text.secondary">{s.k}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Stack>
                        </Box>

                        <Box
                            component="img"
                            src="/images/feature-quote.png"
                            alt="플랫폼 대시보드"
                            sx={{
                                flex: "0 0 420px",
                                width: 420,
                                height: "auto",
                                borderRadius: 3,
                                boxShadow: 3,
                                display: "block",
                            }}
                        />
                    </Box>
                </Container>
            </Box>

            {/* 핵심 기능 3개 — 고정 2열 (이미지|텍스트 → 텍스트|이미지 → 이미지|텍스트) */}
            <Container maxWidth="lg">
                {/* 1) 이미지 | 텍스트 */}
                <FeatureRow
                    img="/images/feature-quote.png"
                    alt="즉시 견적 화면"
                    badge="2분 견적 · 실시간 가격"
                    title="즉시 견적"
                    desc={<>조건만 입력하면 <b>실시간 운임</b>을 확인하고 <b>예약까지 한 번에</b> 진행합니다.
                        경로·차종·시간대에 따라 자동으로 최적 요율을 산정하고, 견적 이력도 보관됩니다.</>}
                    bullets={[
                        "출발/도착·경유지·상/하차 조건 반영",
                        "차량톤수·냉장/냉동·특수옵션 선택",
                        "예약창에서 기사 매칭까지 원스톱",
                    ]}
                    primary={{ label: "지금 견적 받아보기", href: "/estimate" }}
                    secondary={{ label: "샘플 견적서 보기", href: "/service" }}
                />

                {/* 2) 텍스트 | 이미지 */}
                <FeatureRow
                    reverse
                    img="/images/feature-dispatch.png"
                    alt="스마트 배차 화면"
                    badge="AI 추천 · 자동/수동 혼합"
                    title="스마트 배차"
                    desc={<>기사 <b>선호지역/가용시간/차량정보</b>를 반영해 자동으로 최적 기사를 추천합니다.
                        긴급오더도 지연 없이 처리하고, <b>실시간 위치·도착 ETA</b>를 대시보드에서 확인합니다.</>}
                    bullets={[
                        "선호지역·시간대·차종 기반 AI 추천",
                        "실시간 이동 경로/ETA·지연 알림",
                        "대량 오더 엑셀 업로드/일괄 배차",
                    ]}
                    primary={{ label: "배송신청 바로가기", href: "/company/request" }}
                    secondary={{ label: "가용 기사 찾기", href: "/driversearch" }}
                />

                {/* 3) 이미지 | 텍스트 */}
                <FeatureRow
                    img="/images/feature-billing.png"
                    alt="정산 자동화 화면"
                    badge="전자세금계산서 · 리포트"
                    title="정산 자동화"
                    desc={<>운행 종료와 동시에 <b>정산서/PDF</b>를 생성하고, <b>전자세금계산서·입금현황</b>까지 자동으로 집계합니다.
                        월/주/일 단위 <b>KPI 리포트</b>로 비용과 성과를 한눈에 확인하세요.</>}
                    bullets={[
                        "정산서·영수증·세금계산서 자동 발행",
                        "부가비용(대기/할증) 규칙 반영",
                        "월별 비용/성과 리포트 · 다운로드",
                    ]}
                    primary={{ label: "이용 기록 보기", href: "/company/history" }}
                    secondary={{ label: "정산 리포트 샘플", href: "/service" }}
                />
            </Container>
            {/* 4) 서비스 그리드 */}
            <Box sx={{ bgcolor: "grey.50", py: { xs: 8, md: 10 } }}>
                <Container maxWidth="lg">
                    <Typography variant="h5" fontWeight={800} gutterBottom>
                        다람로지틱스의 차별화된 서비스
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {[
                            { t: "기업 전용 대시보드", d: "여러 지점/계정을 한 번에 관리", img: "/images/svc-dashboard.jpeg" },
                            { t: "예약·배차 자동화", d: "규칙/선호 기반 자동 처리", img: "/images/svc-automation.jpeg" },
                            { t: "정산/세금계산서", d: "문서 자동 발급 및 이력 관리", img: "/images/svc-billing.jpeg" },
                            { t: "API 연동", d: "WMS/ERP/쇼핑몰과 손쉬운 연동", img: "/images/svc-api.jpeg" },
                            { t: "알림/메신저", d: "지연/변경 실시간 통지", img: "/images/svc-alert.jpeg" },
                            { t: "보안/권한 관리", d: "역할 기반 접근 제어", img: "/images/svc-security.jpeg" },
                        ].map((s, i) => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Card variant="outlined" sx={{ height: "100%" }}>
                                    <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                        <Box
                                            component="img"
                                            src={s.img}
                                            alt={s.t}
                                            sx={{ width: 56, height: 56 }}
                                        />
                                        <Box>
                                            <Typography fontWeight={700}>{s.t}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {s.d}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
            {/* 3) 공지사항 샘플 */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                    공지사항
                </Typography>
                <Grid container spacing={2}>
                    {[
                        { t: "추석 연휴 배송 운영 안내", d: "연휴 기간 예약/배차 운영 시간 공지" },
                        { t: "v2.3 기능 업데이트", d: "정산 리포트/권한 관리 개선" },
                        { t: "기업 고객 프로모션", d: "대량 계약 고객 할인 이벤트" },
                    ].map((n, i) => (
                        <Grid item xs={12} md={4} key={i}>
                            <Card variant="outlined" sx={{ height: "100%" }}>
                                <CardContent>
                                    <Typography fontWeight={700} gutterBottom>
                                        {n.t}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {n.d}
                                    </Typography>
                                    <Button size="small" sx={{ mt: 1.5 }}>
                                        자세히 보기
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* 4) 가입 CTA */}
            <Box
                sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    py: { xs: 6, md: 8 },
                }}
            >
                <Container maxWidth="lg">
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" fontWeight={800}>
                                다람로지틱스를 지금 시작해보세요
                            </Typography>
                            <Typography sx={{ opacity: 0.9 }}>
                                회원가입 한 번으로 다양한 서비스를 이용하실 수 있습니다.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Button variant="contained" color="inherit" href="/register">
                                    회원가입
                                </Button>
                                <Button variant="outlined" color="inherit" href="/estimate">
                                    견적문의
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}
