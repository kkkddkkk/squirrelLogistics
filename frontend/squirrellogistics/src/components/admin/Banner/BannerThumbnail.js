
import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ButtonContainer, OneButtonAtLeft, OneButtonAtRight, TwoButtonsAtEnd } from "../../common/CommonButton";
import styles from "../../../css/Body.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import logo from "../../common/squirrelLogisticsLogo.png";
import API_SERVER_HOST from "../../../api/apiServerHost";

const BannerThumbnail = ({ children, bannerLength, adding, src, bannerForm, setBannerForm, selectedNotice, id, mobile }) => {
    const thisTheme = useTheme();
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const accessToken = localStorage.getItem('accessToken');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(mobile);
    }, [])

    const previewUrl = useMemo(() => {
        if (preview) return `url(${URL.createObjectURL(preview)})`;
        if (adding) {
            if (id) {
                if (!src) return;
                if (src && typeof src === "string") {
                    const normalizedSrc = src.startsWith('http')
                        ? src
                        : `${API_SERVER_HOST}/public/banner/${src}`;
                    return `url("${normalizedSrc}?t=${Date.now()}")`;
                }
            } else {
                return `url(${logo})`;
            }
        } else {
            if (!src) return;
            const normalizedSrc = src.startsWith('http') ? src : `${API_SERVER_HOST}/public/banner/${src}`;
            return `url("${normalizedSrc}?t=${Date.now()}")`;
        }
    }, [preview, src]);

    const onChange = (key) => (e) => {
        const v = e.target.value;
        setBannerForm((p) => ({ ...p, [key]: v }));
    };

    const handleClickAddImg = () => {//file input 강제 클릭
        fileRef.current.click();
    }

    const handleImgChange = (e) => {//사진 입력
        setPreview(e.target.files[0]);
        setBannerForm((prev) => ({ ...prev, "img": e.target.files[0] }));
    };

    const handleClickNavigate = () => {
        if (adding) {
            if (!selectedNotice.id) {
                alert("아직 공지사항이 연결되지 않았습니다.");
            } else {
                alert(`클릭 시 ${selectedNotice.id}번 공지사항(제목: ${selectedNotice.title})의 상세보기 페이지로 이동됩니다.`);
            }
        } else {
            alert(`클릭 시 ${bannerForm.bannerId}번 공지사항(제목: ${bannerForm.title})의 상세보기 페이지로 이동됩니다.`);
        }

    }

    return adding ?
        (
            <>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    style={{ display: "none" }}
                    onChange={handleImgChange}
                />
                <Box role="img" key={src} aria-label={bannerForm.title} sx={{
                    aspectRatio: 3,
                    width: "100%",
                    borderRadius: '10px',
                    marginBottom: 5,
                    backgroundImage: previewUrl,
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "space-between",
                    paddingLeft: isMobile ? 2 : 5,
                    paddingRight: isMobile ? 2 : 5,
                    paddingBottom: isMobile ? 0 : 3,
                    backgroundSize: 'cover',        // 박스를 완전히 채우면서 비율 유지
                    backgroundPosition: 'center',   // 중앙 기준으로 잘라서 보여줌
                    backgroundRepeat: 'no-repeat',  // 반복 없이 한 장만
                }}>
                    <Box width={"100%"}>
                        <Typography variant={isMobile ? "body1" : "h6"} fontWeight={isMobile ? 600 : 800} lineHeight={1.15} width={"100%"}>
                            {bannerForm.title === '' ? '제목을 입력해주세요.' : bannerForm.title}
                        </Typography>
                        <Typography variant={isMobile ? "subtitle1" : "body1"} className={styles.desc} width={"100%"}>
                            {bannerForm.subTitle === '' ? '부제목을 입력해주세요.' : bannerForm.subTitle}
                        </Typography>
                        <Box width={"100%"} display={"flex"} justifyContent={"space-between"}>
                            <Button onClick={handleClickNavigate} variant="contained">
                                바로가기
                            </Button>
                            <Button onClick={handleClickAddImg} variant="contained"> 
                                사진추가
                            </Button>
                        </Box>

                    </Box>
                </Box >
            </>
        )
        :
        (
            <Box sx={{
                aspectRatio: 3,
                width: "100%",
                border: src ? 'none' : `1px dashed ${thisTheme.palette.text.secondary} !important`,
                borderRadius: '10px',
                marginBottom: 5,
                display: "flex",
                alignItems: src ? "end" : "center",
                justifyContent: src ? "space-between" : "center",
                paddingLeft: 5,
                paddingRight: 5,
                paddingBottom: src ? 3 : 0,
                color: src ? thisTheme.palette.text.primary : thisTheme.palette.text.secondary,
                backgroundImage: src ? previewUrl : "",
                backgroundColor: thisTheme.palette.background.paper,
                backgroundSize: 'cover',        // 박스를 완전히 채우면서 비율 유지
                backgroundPosition: 'center',   // 중앙 기준으로 잘라서 보여줌
                backgroundRepeat: 'no-repeat',  // 반복 없이 한 장만
            }}>
                {src ?
                    <Box width={"100%"}>
                        <Typography variant={"h6"} fontWeight={800} lineHeight={1.15} width={"100%"}>
                            {bannerForm.title}
                        </Typography>
                        <Typography variant="body1" className={styles.desc} width={"100%"}>
                            {bannerForm.subTitle}
                        </Typography>
                        <ButtonContainer width={"100%"} marginTop={2}>
                            <OneButtonAtLeft clickEvent={handleClickNavigate}>
                                바로가기
                            </OneButtonAtLeft>
                        </ButtonContainer>

                    </Box> :
                    bannerLength == 0 ?
                        "아직 등록된 배너가 없습니다. 배너 추가 버튼으로 새 배너를 등록해주세요." :
                        "배너 리스트를 클릭하여 배너를 미리 확인할 수 있습니다."
                }


            </Box>
        )
}
export default BannerThumbnail;