import {
    CircularProgress,
    Container,
    IconButton,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from "@mui/material";
import {Link} from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {User} from "../../models/User";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";

export const UserByWrittenChars = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_API_URL}/statistics/users-by-chars-written/`)
            .then((response) => {
                setUsers(response.data);
                setLoading(false);
            });
    }, []);

    return (
        <Container>
            <h1>Users List</h1>
            {loading && <CircularProgress/>}
            {!loading && users.length === 0 && <div>No users</div>}
            {!loading && users.length > 0 && (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Password</TableCell>
                                <TableCell>WrittenChars</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user: User, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.password}</TableCell>
                                    <TableCell>{user.written_chars ?? 0}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};