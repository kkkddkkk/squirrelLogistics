// src/admin/VehiclesPage.jsx
import { useEffect, useState } from "react";
import { api } from "../../api/admin/api";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function VehiclesPage() {
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [q, setQ] = useState("");

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ id: null, plate: "", type: "1톤 탑차", driverId: null, mileage: 0, status: "IDLE" });

    const load = async () => {
        const data = await api.listVehicles({ q, page, size: pageSize });
        setRows(data.content); setTotal(data.total);
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, pageSize]);

    const onSave = async () => {
        if (form.id) await api.updateVehicle(form.id, form);
        else await api.createVehicle(form);
        setOpen(false); setForm({ id: null, plate: "", type: "1톤 탑차", driverId: null, mileage: 0, status: "IDLE" });
        load();
    };
    const onDelete = async (id) => { if (window.confirm("삭제하시겠습니까?")) { await api.deleteVehicle(id); load(); } };

    return (
        <Box>
            <Stack direction="row" spacing={1} mb={1}>
                <TextField size="small" placeholder="차량번호 검색" value={q} onChange={e => setQ(e.target.value)} />
                <Button variant="outlined" onClick={() => { setPage(0); load(); }}>검색</Button>
                <Box flex={1} />
                <Button variant="contained" onClick={() => { setForm({ id: null, plate: "", type: "1톤 탑차", driverId: null, mileage: 0, status: "IDLE" }); setOpen(true); }}>추가</Button>
            </Stack>

            <DataGrid
                rows={rows} rowCount={total} getRowId={(r) => r.id}
                columns={[
                    { field: "id", headerName: "ID", width: 70 },
                    { field: "plate", headerName: "차량번호", width: 150 },
                    { field: "type", headerName: "차종", width: 140 },
                    { field: "driverId", headerName: "기사ID", width: 120 },
                    { field: "mileage", headerName: "주행거리", width: 120 },
                    { field: "status", headerName: "상태", width: 120 },
                    {
                        field: "actions", headerName: "작업", width: 180, sortable: false,
                        renderCell: ({ row }) => (
                            <Stack direction="row" spacing={1}>
                                <Button size="small" onClick={() => { setForm(row); setOpen(true); }}>수정</Button>
                                <Button size="small" color="error" onClick={() => onDelete(row.id)}>삭제</Button>
                            </Stack>
                        )
                    },
                ]}
                paginationMode="server"
                paginationModel={{ page, pageSize }}
                onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
                autoHeight
            />

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{form.id ? "차량 수정" : "차량 등록"}</DialogTitle>
                <DialogContent>
                    <Stack mt={1} spacing={1.5}>
                        <TextField label="차량번호" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} />
                        <TextField label="차종" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
                        <TextField label="배정 기사ID" value={form.driverId ?? ""} onChange={e => setForm({ ...form, driverId: e.target.value ? Number(e.target.value) : null })} />
                        <TextField label="주행거리" type="number" value={form.mileage} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} />
                        <TextField label="상태(IDLE/ON_DUTY/MAINT)" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={onSave}>저장</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
