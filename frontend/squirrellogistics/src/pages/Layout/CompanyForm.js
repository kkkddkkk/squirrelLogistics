import { Box, TextField, Typography, Button, Checkbox, FormControlLabel } from "@mui/material";

export default function CompanyForm() {
    return (
        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6">기본 정보</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField label="회사 이름" fullWidth />
                <TextField label="아이디" fullWidth />
                <TextField label="이메일" fullWidth />
                <TextField label="연락처" fullWidth />
                <TextField label="비밀번호" type="password" fullWidth />
                <TextField label="비밀번호 확인" type="password" fullWidth />
                <TextField label="주소" fullWidth />
                <TextField label="상세주소" fullWidth />
                <TextField label="계좌번호" fullWidth />
                <TextField label="사업자 등록번호" fullWidth />
            </Box>

            <Box sx={{ border: '1px solid #ccc', padding: 2, maxHeight: 150, overflowY: 'auto' }}>
                <Typography variant="body2">
                    [약관 내용 삽입] 회원 이용 약관을 스크롤 가능한 영역에 표시합니다.
                </Typography>
            </Box>
            <FormControlLabel control={<Checkbox />} label="개인정보 수집 및 이용 약관에 동의합니다." />

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained">회원가입</Button>
                <Button variant="outlined">취소</Button>
            </Box>
        </Box>
    );
}
