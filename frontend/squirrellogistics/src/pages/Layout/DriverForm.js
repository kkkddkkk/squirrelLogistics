import { Box, TextField, MenuItem, Typography, Button, Checkbox, FormControlLabel } from "@mui/material";

export default function DriverForm() {
    return (
        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* 기본정보 */}
            <Typography variant="h6">기본 정보</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField label="이름" fullWidth />
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

            {/* 차량등록 */}
            <Typography variant="h6" sx={{ mt: 3 }}>차량 등록</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField label="차종" select defaultValue="1톤 트럭" fullWidth>
                    <MenuItem value="1톤 트럭">1톤 트럭</MenuItem>
                    <MenuItem value="2.5톤 트럭">2.5톤 트럭</MenuItem>
                </TextField>
                <TextField label="차량 번호" fullWidth />
                <TextField label="차량 보험 가입 여부" select defaultValue="가입" fullWidth>
                    <MenuItem value="가입">가입</MenuItem>
                    <MenuItem value="미가입">미가입</MenuItem>
                </TextField>
                <TextField label="운전면허증 번호" fullWidth />
                <TextField label="일련번호" fullWidth />
                <TextField label="운전면허 유효기간" fullWidth />
                <Button variant="outlined">운전면허 진위확인</Button>
                <TextField label="운행 가능 시간대" select defaultValue="07:00AM ~ 18:00PM" fullWidth>
                    <MenuItem value="07:00AM ~ 18:00PM">07:00AM ~ 18:00PM</MenuItem>
                    <MenuItem value="18:00PM ~ 01:00AM">18:00PM ~ 01:00AM</MenuItem>
                </TextField>
                <TextField label="운행 가능 지역" select defaultValue="서울" fullWidth>
                    <MenuItem value="서울">서울</MenuItem>
                    <MenuItem value="경기">경기</MenuItem>
                    <MenuItem value="부산">부산</MenuItem>
                </TextField>
            </Box>

            {/* 약관 동의 */}
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
