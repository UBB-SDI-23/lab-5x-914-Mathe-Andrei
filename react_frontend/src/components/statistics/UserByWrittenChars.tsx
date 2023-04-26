import {
    Box,
    CircularProgress,
    Container, IconButton,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead,
    TableRow, Typography
} from "@mui/material";
import {User} from "../../models/User";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export const UserByWrittenChars = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const itemsPerPage = 25;

    useEffect(() => {
        setLoading(true);
        axios.get(`${BACKEND_API_URL}/statistics/users-by-chars-written?page=${pageNumber}`)
            .then((response) => {
                setUsers(response.data);
                setLoading(false);
            });
    }, [pageNumber]);

    const handleOnPreviousPage = () => {
        setPageNumber(pageNumber - 1);
    };

    const handleOnNextPage = () => {
        setPageNumber(pageNumber + 1);
    };

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
                                    <TableCell>Password</TableCell>
                                    <TableCell>WrittenChars</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user: User, index) => (
                                    <TableRow key={index + 1}>
                                        <TableCell>{(pageNumber - 1) * itemsPerPage + index + 1}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.password}</TableCell>
                                        <TableCell>{user.written_chars ?? 0}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{mt: 2, gap: 1}}>
                        <IconButton disabled={pageNumber == 1} onClick={handleOnPreviousPage}>
                            <NavigateBeforeIcon color={"primary"} fontSize={"large"}/>
                        </IconButton>
                        <IconButton onClick={handleOnNextPage}>
                            <NavigateNextIcon color={"primary"} fontSize={"large"}/>
                        </IconButton>
                    </Box>
                </>
            )}
        </Container>
    );
};