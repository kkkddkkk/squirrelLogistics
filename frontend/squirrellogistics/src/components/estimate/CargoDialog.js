import React, { useEffect, useMemo, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, FormHelperText
} from "@mui/material";

export default function CargoDialog({ open, onClose, onSave, options = [], initialCargo }) {
    const [description, setDescription] = useState("");
    const [handlingId, setHandlingId] = useState("");  // "" = 없음
    const [weightTon, setWeightTon] = useState(1);

    useEffect(() => {
        if (initialCargo) {
            setDescription(initialCargo.description ?? "");
            setHandlingId(
                initialCargo.handlingId === null || initialCargo.handlingId === undefined
                    ? ""
                    : String(initialCargo.handlingId)
            );
            const ton = Math.max(1, Math.min(26, Math.round((initialCargo.weightKg ?? 1000) / 1000)));
            setWeightTon(ton);
        } else {
            setDescription("");
            setHandlingId("");
            setWeightTon(1);
        }
    }, [initialCargo, open]);

    const selectedOption = useMemo(
        () => options.find(o => String(o.handlingId) === handlingId),
        [options, handlingId]
    );

    const handleApply = () => {
        if (!description || !weightTon) {
            alert("제품명과 무게는 필수입니다.");
            return;
        }
        onSave({
            description,
            handlingId: handlingId === "" ? null : Number(handlingId),
            weightKg: weightTon * 1000,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>화물 정보 입력</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="제품명"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    select
                    label="취급 종류"
                    value={handlingId}
                    onChange={(e) => setHandlingId(e.target.value)}
                    margin="normal"
                >
                    <MenuItem value="">없음</MenuItem>
                    {options.map(opt => (
                        <MenuItem key={opt.handlingId} value={String(opt.handlingId)}>
                            {opt.handlingTags} {opt.extraFee ? `(+${Number(opt.extraFee).toLocaleString()}원)` : ""}
                        </MenuItem>
                    ))}
                </TextField>

                {selectedOption && (
                    <FormHelperText sx={{ mb: 1 }}>
                        선택된 태그: {selectedOption.handlingTags}
                        {selectedOption.extraFee ? `, 추가요금: ${Number(selectedOption.extraFee).toLocaleString()}원` : ""}
                    </FormHelperText>
                )}

                <div style={{ margin: "20px 0" }}>
                    <label>📦 무게 선택 (1톤 ~ 26톤)</label>
                    <input
                        type="range"
                        min="1"
                        max="26"
                        value={weightTon}
                        onChange={(e) => setWeightTon(Number(e.target.value))}
                        style={{ width: "92%", margin: "0 auto", display: "block", boxSizing: "border-box" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, width: "92%", margin: "0 auto" }}>
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