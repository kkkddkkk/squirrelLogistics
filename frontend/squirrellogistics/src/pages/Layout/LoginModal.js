import {
    Dialog,
    DialogContent,
    TextField,
    Button,
    Typography,
    Checkbox,
    FormControlLabel,
    IconButton,
    Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GoogleIcon from "@mui/icons-material/Google";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble"; // 카카오 대체용
import { useNavigate } from "react-router-dom";

export default function LoginModal({ open, onClose }) {
    
    const navigate = useNavigate();
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ width: 400, p: 4, position: "relative" }}>
                {/* 닫기 버튼 */}
                <IconButton
                    onClick={onClose}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                >
                    <CloseIcon />
                </IconButton>

                {/* 로고 + 인사말 */}
                <Box sx={{ textAlign: "center", mb: 2 }}>
                    <img
                        src="/images/logo.png"
                        alt="logo"
                        style={{ width: 80, marginBottom: 8 }}
                    />
                    <Typography variant="h6" fontWeight="bold">환영합니다</Typography>
                    <Typography variant="body2">
                        다람로지틱스에서는 손쉽게<br />물류 중개 서비스를 이용하실 수 있습니다
                    </Typography>
                </Box>

                {/* 로그인 폼 */}
                <TextField fullWidth label="아이디" margin="dense" />
                <TextField fullWidth label="비밀번호" type="password" margin="dense" />
                <FormControlLabel control={<Checkbox />} label="아이디 저장" />

                <Button fullWidth variant="contained" sx={{ backgroundColor: "#007aff", mt: 2 }}>
                    시작하기
                </Button>

                {/* 소셜 로그인 */}
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<GoogleIcon />}
                        sx={{ backgroundColor: "#fff", borderColor: "#ccc" }}
                    >
                        구글 로그인
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ChatBubbleIcon />}
                        sx={{ backgroundColor: "#fee500", color: "#000" }}
                    >
                        카카오 로그인
                    </Button>
                </Box>

                {/* 하단 링크 */}
                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <Button
                        onClick={() => {
                            onClose();           // 모달 닫기
                            navigate("/register");
                        }}
                    >
                        회원가입
                    </Button>
                    <Typography sx={{ cursor: "pointer" }}>비밀번호 찾기</Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
