import { Box, Button, Typography } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import useHistoryMove from "../../hook/historyHook/useHistoryMove";



export const Title = ({ children }) => {
    return (
        <Typography
            variant="h6"
            component="p"
            sx={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2A2A2A',
                width: '100%',
                margin: '3%',
                lineHeight: 1.2,
                alignSelf: "flex-start"
            }}
        >
            {children}
        </Typography>
    )
}

export function SubTitle({ children }) {
    return (
        <Typography
            variant="h6"
            color="#2A2A2A"
            width={"100%"}
            marginBottom={"2%"}
        >
            {children}
        </Typography>
    )
}

export const Layout = ({ title, children }) => {
    return (
        <Box
            bgcolor={"#F5F7FA"}
            display="flex"
            width={"100%"}
            // height={"100vh"}
            // marginBottom={"2%"}
            flexWrap={"wrap"}
            minHeight={"100vh"}
            gap={0}
            flexDirection={"column"}
            justifyContent={"flex-start"}
            alignItems={"baseline"}
        >
            {title ? <Title>{title}</Title> : <></>}
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                {children}
            </div>
        </Box>
    )
}

export const ListBoxContainer = ({ children, header, id, assignStatus, isExpand, setIsExpand, useButton }) => {

    const handleExpand = () => {
        if (!isExpand) setIsExpand(true);
        else setIsExpand(false);
    }

    let color = '';
    if (assignStatus === "예약") color = "#113F67";
    if (assignStatus === "배송중") color = "#E8A93F";
    if (assignStatus === "배송완료") color = "#31A04F";
    if (assignStatus === "취소") color = "#A20025";
    if (assignStatus === "미정산") color = "#A20025";
    if (assignStatus === "") color = 0;



    return (
        <Box
            sx={{
                width: "90%",
                border: "1px solid #2A2A2A",
                borderRadius: "5px",
                padding: "7px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2%",
                flexWrap: "wrap"

            }}
            className="listBoxContainer"
        >
            {/* 숨겨진 ID */}
            <input type="hidden" value={id} />

            {/* 왼쪽: 주소 */}
            <Typography
                sx={{
                    flex: 1,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    margin: "2% 0",
                    display: "inline-block"
                }}
            >
                {header}
            </Typography>

            {/* 오른쪽: 배송완료 + children */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "6px"
                }}
            >
                <Box sx={{ display: "flex", marginRight: "5%" }}>
                    {useButton ?
                        <Box
                            sx={{
                                borderRadius: "5px",
                                border: `1px solid ${color}`,
                                padding: "2px 6px",
                                whiteSpace: "nowrap",
                                marginRight: "5%",
                                color: color
                            }}
                        >
                            {assignStatus}
                        </Box> : <></>
                    }

                    {isExpand ?
                        <ExpandLessIcon cursor={"pointer"} onClick={handleExpand} /> :
                        <ExpandMoreIcon cursor={"pointer"} onClick={handleExpand} />
                    }
                </Box>
            </Box>

            {children}
        </Box>

    )
}

export const ImgBox = ({ func, children, sx }) => {//기본 ImgBox
    return (
        <Box sx={{
            width: "100%",
            aspectRatio: "1/1",
            marginLeft: "2%",
            display: "flex",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: 1,
            marginBottom: "5%",
            ...sx
        }}
            onClick={func}
        >
            {children}
        </Box>
    )
}

export const AddImgInput = ({ fileRef, funcAdd, funcChange, preview }) => {//사진추가 인풋
    return (
        <Box>
            <input
                type="file"
                accept="image/*"
                ref={fileRef}
                style={{ display: "none" }} // 화면에서 숨김
                onChange={funcChange}
            />
            <ImgBox func={funcAdd} preview={preview} sx={{
                backgroundColor: "#113F67",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <AddIcon sx={{
                    color: "#F5F7FA",
                    fontSize: 45
                }} />
            </ImgBox>
        </Box>
    )
}

export const AddedImg = ({ preview, idx, func }) => {//추가된 사진

    return (
        <ImgBox sx={{
            backgroundImage: `url(${URL.createObjectURL(preview)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            justifyContent: "end",
            alignItems: "baseline",
        }}>
            <Box sx={{ backgroundColor: "#F5F7FA", opacity: "0.5" }}>
                <CloseIcon onClick={(e) => func(e, idx)} sx={{ color: "#2A2A2A" }} />
            </Box>
        </ImgBox >
    )
}

export const paymentFormat = ((payment) => {//숫자 형식
    if (payment == null) return "0"
    return payment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});

export const NoneOfList = ({ logoSrc, children }) => {//list에 아무것도 없을 때 표시화면

    const { moveBack } = useHistoryMove();

    return (
        <>
            <Box display={"flex"} justifyContent={"center"} flexWrap={"wrap"}>
                <Box
                    component="img"
                    src={logoSrc}
                    alt="로고"
                    sx={{
                        width: "100%",        // 원하는 높이
                        width: "auto",     // 비율 유지
                        margin: "10% 0"
                    }}
                />
                <Typography width={"100%"} textAlign={"center"}
                    fontSize={"25px"} fontWeight={"bold"}
                    marginBottom={"10%"}
                >{children}</Typography>
                <OneBigBtn func={() => moveBack()}>뒤로가기</OneBigBtn>

            </Box>

        </>

    )
}



//#region [버튼]
export const TwoBtns = ({ children1, children2, func1, func2, disabled1, disabled2 }) => {
    return (
        <Box>
            <Button
                variant="contained"
                sx={{ marginRight: "7px" }}
                onClick={func1}
                disabled={disabled1}
            >
                {children1}
            </Button>
            <Button
                variant="contained"
                onClick={func2}
                disabled={disabled2}
            >
                {children2}
            </Button>
        </Box>
    );
}

export const OneBigBtn = ({ children, disabled, func, margin }) => {
    return (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Button
                type="submit"
                variant="contained"
                sx={{ width: "60%", height: "50px", margin: { margin }, fontSize: "25px" }}
                onClick={func}
                disabled={disabled}
            >
                {children}
            </Button>
        </Box>
    )
}

export const OneBtnAtRight = ({ children, disabled, func, margin }) => {
    return (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
            <Button
                type="submit"
                variant="contained"
                sx={{ width: "30%", height: "50px", margin: { margin }, fontSize: "16px" }}
                onClick={func}
                disabled={disabled}
            >
                {children}
            </Button>
        </Box>
    )
}

//#endregion


