import {
    Box,
    CircularProgress,
    Container,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead,
    TableRow, Typography
} from "@mui/material";
import {User} from "../../models/User";
import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {Paginator} from "../misc/Paginator";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../../services/AuthProvider";

export const UserByWrittenChars = () => {
    const navigate = useNavigate();
    const context = useContext(AuthContext);

    useEffect(() => {
        if (!context?.authenticated) {
            navigate('/login', {replace: true});
        }
    }, [context?.authenticated]);

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(0);

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_API_URL}/statistics/users-by-chars-written?page=${pageNumber}`)
            .then((response) => {
                setUsers(response.data.results);
                setTotalItems(response.data.count);
                setPageSize(response.data.page_size);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [pageNumber]);

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
            <Typography variant={"h3"} align={"center"}>Users by number of written characters</Typography>
            {loading && (
                <Box>
                    <CircularProgress sx={{mt: 3}}/>
                </Box>
            )}
            {!loading && (
                <>
                    <TableContainer sx={{mt: 3}}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>WrittenChars</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user: User, index) => (
                                    <TableRow key={index + 1}>
                                        <TableCell>{(pageNumber - 1) * pageSize + index + 1}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.written_chars ?? 0}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Paginator
                        sx={{mt: 2, gap: 1}}
                        pageSize={pageSize}
                        totalItems={totalItems}
                        currentPage={pageNumber}
                        paginate={(number) => setPageNumber(number)}
                    />
                </>
            )}
        </Container>
    );
};