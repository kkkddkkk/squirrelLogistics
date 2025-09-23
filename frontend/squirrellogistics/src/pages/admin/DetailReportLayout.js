import { Box, Divider, Grid, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const DetailReportLayout = () => {
    const location = useLocation();  // 현재 경로 정보
    const pathArray = location.pathname.split("/").filter(Boolean);
    const lastPath = pathArray[pathArray.length - 1];

    console.log(lastPath);

    const ReportListMenu = ({ children, divider, route }) => {
        const thisTheme = useTheme();
        const navigate = useNavigate();
        const [hovered, setHovered] = useState(false);
        const [active, setActive] = useState(false);

        const isActive = hovered || active;
        useEffect(() => {
            if (lastPath === route) setActive(true);
            else setActive(false);
        }, [])
        const fontSize = isActive ? 28 : 20; // px 단위, 원하는 크기

        const clickMenu = () => {
            setActive(!active);
            navigate(`/admin/report/list/${route}`);
        }

        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
                <Typography
                    sx={{
                        textAlign: "center",
                        color: isActive ? thisTheme.palette.primary.main : thisTheme.palette.text.primary,
                        fontWeight: "bold",
                        margin: "3% 0",
                        cursor: "pointer",
                        fontSize: fontSize,
                        transition: "all 0.3s ease",
                        display: "inline-block",
                    }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={clickMenu}
                >
                    {children}
                </Typography>
                {divider ?
                    <Divider
                        orientation="vertical"
                        sx={{
                            borderRightWidth: 2,
                            borderColor: (theme) => theme.palette.text.primary,
                            height: '1em',       // 글자 높이에 맞춤
                            alignSelf: 'center', // 부모 flex 중앙 정렬
                        }}
                    /> : <></>
                }
            </Box>
        );
    };
    return (

        <Grid container spacing={3} marginBottom={10}>
            <Grid size={12} display={"flex"} justifyContent={"center"} alignItems={"center"} margin={"3% 0"} gap={2}>
                <ReportListMenu divider={true} route={"status"}>문의 처리 상태</ReportListMenu>
                <ReportListMenu divider={true} route={"rank"}>신고된 랭킹</ReportListMenu>
                <ReportListMenu divider={true} route={"cate"}>신고 유형 비율</ReportListMenu>
                <ReportListMenu divider={false} route={"monthly"}>월별 신고 건수</ReportListMenu>
            </Grid>
            <Grid size={2} />
            <Grid size={8}>
                <Outlet />
            </Grid>
            <Grid size={2} />
        </Grid >
    );
}
export default DetailReportLayout;