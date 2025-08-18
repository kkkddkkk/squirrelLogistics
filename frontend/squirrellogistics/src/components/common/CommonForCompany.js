import { Box, Button, Typography } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

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

export const ListBoxContainer = ({ children, header, id }) => {

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
                flexWrap: "wrap",
                marginBottom: "2%"
            }}
            className="listBoxContainer"
        >
            <input type="hidden" value={id}></input>
            <Typography sx={{ margin: "2%" }}>{header}</Typography>
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

export const AddImgInput = ({fileRef, funcAdd, funcChange, preview}) => {//사진추가 인풋
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



//#region [버튼]
export const TwoBtns = ({ children1, children2, func1, func2 }) => {
    return (
        <Box>
            <Button
                variant="contained"
                sx={{ marginRight: "7px" }}
                onClick={func1}
            >
                {children1}
            </Button>
            <Button
                variant="contained"
                onClick={func2}
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

//#endregion


