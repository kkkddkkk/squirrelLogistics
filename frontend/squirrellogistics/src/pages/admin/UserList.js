// src/pages/admin/UserList.jsx
import React, { useEffect, useState } from "react";
import { api } from "../../api/admin/api";
import {
    Table, TableHead, TableRow, TableCell, TableBody,
    Button, Typography, Box
} from "@mui/material";

export default function UserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.listUsers({}).then(setUsers);
    }, []);

    return (
        <Box p={3}>
            <Typography variant="h6">회원 관리</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>이름</TableCell>
                        <TableCell>이메일</TableCell>
                        <TableCell>권한</TableCell>
                        <TableCell>작업</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((u) => (
                        <TableRow key={u.userId}>
                            <TableCell>{u.userId}</TableCell>
                            <TableCell>{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.role}</TableCell>
                            <TableCell>
                                <Button size="small" color="error" onClick={() => api.deleteUser(u.userId)}>삭제</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}
