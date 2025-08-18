import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Grid } from '@mui/material';
import { useRef } from 'react';


const ReportImg = ({ func, addPic, preview, setPreview }) => {
    const fileRef = useRef(null);

    const handleClickAddImg = () => {
        fileRef.current.click();
    }

    const handleImgChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result); // base64 URL 저장
        };
        reader.readAsDataURL(file);
    };

    const handleImgRemove = (e) => {
        e.stopPropagation(); // 상위(Box)로 이벤트 전파 방지
        // eslint-disable-next-line no-restricted-globals
        if (confirm('사진을 삭제하시겠습니까?')) {
            setPreview(false);
            return;
        }
    }

    return (
        <Box>
            <input
                type="file"
                accept="image/*"
                ref={fileRef}
                style={{ display: "none" }} // 화면에서 숨김
                onChange={handleImgChange}
            />

            <Box sx={{
                width: "18%",
                aspectRatio: "1/1",
                marginLeft: "2%",
                backgroundColor: "#113F67",
                backgroundImage: preview ? `url(${preview})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: preview ? "end" : "center",
                alignItems: preview ? "baseline" : "center",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: 1,
                marginBottom: "5%"
            }}
                onClick={addPic ? handleClickAddImg : func}
            >
                {preview ?
                    <Box sx={{ backgroundColor: "#F5F7FA", opacity: "0.5" }}>
                        <CloseIcon onClick={handleImgRemove} sx={{ color: "#2A2A2A" }} />
                    </Box> : <AddIcon sx={{
                        color: "#F5F7FA",
                        fontSize: 45
                    }} />}
            </Box>
        </Box>
    )
}

export default ReportImg;