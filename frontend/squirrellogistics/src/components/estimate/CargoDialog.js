import React, { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem
} from "@mui/material";

export default function CargoDialog({ open, onClose, onSave }) {
    const [description, setDescription] = useState("");
    const [handlingId, setHandlingId] = useState("");
    const [weightTon, setWeightTon] = useState(1); // 톤 단위 선택 (1~26)

    const handleApply = () => {
        if (!description || !handlingId || !weightTon) {
            alert("모든 항목을 입력하세요");
            return;
        }
        onSave({
            description,
            handlingId: Number(handlingId),
            weightKg: weightTon * 1000, // 톤 → kg 변환
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>화물 정보 입력</DialogTitle>
            <DialogContent>
                {/* 제품명 */}
                <TextField
                    fullWidth
                    label="제품명"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                />

                {/* 취급 종류 */}
                <TextField
                    fullWidth
                    select
                    label="취급 종류"
                    value={handlingId}
                    onChange={(e) => setHandlingId(e.target.value)}
                    margin="normal"
                >
                    <MenuItem value={1}>일반</MenuItem>
                    <MenuItem value={2}>위험물</MenuItem>
                    <MenuItem value={3}>냉장식품</MenuItem>
                </TextField>

                {/* 무게 선택 (슬라이더) */}
                <div style={{ margin: "20px 0" }}>
                    <label>📦 무게 선택 (1톤 ~ 26톤)</label>
                    <input
                        type="range"
                        min="1"
                        max="26"
                        value={weightTon}
                        onChange={(e) => setWeightTon(Number(e.target.value))}
                        style={{
                            width: "92%",        // ✅ 다이얼로그 안쪽에 맞추기
                            margin: "0 auto",    // 가운데 정렬
                            display: "block",    // 블록화
                            boxSizing: "border-box"
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "8px",
                            width: "92%",       // ✅ 라벨도 같은 폭에 맞춤
                            margin: "0 auto"
                        }}
                    >
                        <span>1톤</span>
                        <span>{weightTon}톤</span>
                        <span>26톤</span>
                    </div>
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button variant="contained" onClick={handleApply}>적용하기</Button>
            </DialogActions>
        </Dialog>
    );
}