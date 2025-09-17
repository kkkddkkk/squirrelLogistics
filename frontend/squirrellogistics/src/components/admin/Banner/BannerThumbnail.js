
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ButtonContainer, OneButtonAtLeft, OneButtonAtRight, TwoButtonsAtEnd } from "../../common/CommonButton";
import styles from "../../../css/Body.module.css";
import { useMemo, useRef, useState } from "react";
import logo from "../../common/squirrelLogisticsLogo.png";

const BannerThumbnail = ({ children, bannerLength, adding, src, bannerForm, setBannerForm }) => {
    const thisTheme = useTheme();
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const previewUrl = useMemo(() => {
        if (!preview) return `url(${logo})`; // 초기 로고
        return `url(${URL.createObjectURL(preview)})`;
    }, [preview]);

    const onChange = (key) => (e) => {
        const v = e.target.value;
        setBannerForm((p) => ({ ...p, [key]: v }));
    };

    const handleClickAddImg = () => {//file input 강제 클릭
        fileRef.current.click();
    }

    const handleImgChange = (e) => {//사진 입력
        setPreview(e.target.files[0]);
        setBannerForm((prev)=>({...prev, "img":e.target.files[0]}));
    };

    const handleImgRemove = (e, idx) => {
        e.stopPropagation();//이벤트 상위 전파 방지
        // eslint-disable-next-line no-restricted-globals
        if (confirm('사진을 삭제하시겠습니까?')) {//선택한 사진만 삭제
            setPreview('');
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
                <Box role="img" aria-label={bannerForm.title} sx={{
                    aspectRatio: 3,
                    width: "100%",
                    borderRadius: '10px',
                    marginBottom: 5,
                    backgroundImage: previewUrl,
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "space-between",
                    paddingLeft: 5,
                    paddingRight: 5,
                    paddingBottom: 3,
                    backgroundSize: 'cover',        // 박스를 완전히 채우면서 비율 유지
                    backgroundPosition: 'center',   // 중앙 기준으로 잘라서 보여줌
                    backgroundRepeat: 'no-repeat',  // 반복 없이 한 장만
                }}>
                    <Box width={"100%"}>
                        <Typography variant={"h6"} fontWeight={800} lineHeight={1.15} width={"100%"}>
                            {bannerForm.title === '' ? '제목을 입력해주세요.' : bannerForm.title}
                        </Typography>
                        <Typography variant="body1" className={styles.desc} width={"100%"}>
                            {bannerForm.subTitle === '' ? '부제목을 입력해주세요.' : bannerForm.subTitle}
                        </Typography>
                        <ButtonContainer width={"100%"} marginTop={2}>
                            <TwoButtonsAtEnd
                                leftTitle={"바로가기"}
                                leftDisabled={true}
                                rightTitle={"사진추가"}
                                rightClickEvent={handleClickAddImg}
                            />
                        </ButtonContainer>

                    </Box>
                </Box >
            </>
        )
        :
        (
            <Box sx={{
                aspectRatio: 3,
                width: "100%",
                border: `1px dashed ${thisTheme.palette.text.secondary} !important`,
                borderRadius: '10px',
                marginBottom: 5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: thisTheme.palette.text.secondary,
                backgroundColor: thisTheme.palette.background.paper
            }}>
                {bannerLength == 0 ?
                    "아직 등록된 배너가 없습니다. 배너 추가 버튼으로 새 배너를 등록해주세요." :
                    "배너 리스트를 클릭하여 배너를 미리 확인할 수 있습니다."}

            </Box>
        )
}
export default BannerThumbnail;