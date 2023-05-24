import {
    Box,
    CircularProgress,
    Container,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead, TableRow, TextField,
    Typography
} from "@mui/material";
import {Paginator} from "../misc/Paginator";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {User} from "../../models/User";

export const FilterUsersByCreatedDate = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [year, setYear] = useState<number>(1900);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(1);

    useEffect(() => {
        if (!isNaN(year)) {
            setLoading(true);
            console.log(`${BACKEND_API_URL}/users?page=${pageNumber}&year=${Math.max(1900, year)}`);
            axios.get(`${BACKEND_API_URL}/users?page=${pageNumber}&year=${Math.max(1900, year)}`)
                .then((response) => {
                    setUsers(response.data.results);
                    setTotalItems(response.data.count);
                    setPageSize(response.data.page_size);
                    setLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [year, pageNumber]);

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
            <Typography variant={"h3"} align={"center"}>Users by year</Typography>
            <TextField
                sx={{m: 3}}
                label={"year"}
                type={"number"}
                variant={"outlined"}
                value={year}
                InputProps={{ inputProps: { min: "1900", max: "9999", step: "1" } }}
                onChange={(event) => {
                    let value = (event.target.value === "") ? NaN : parseInt(event.target.value);
                    if (isNaN(value) || value <= 9999) {
                        setYear(value);
                        setPageNumber(1);
                    }
                }}
            />
            {loading && (
                <Box>
                    <CircularProgress sx={{mt: 3}}/>
                </Box>
            )}
            {!loading && (
                <>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Password</TableCell>
                                    <TableCell>Created at</TableCell>
                                    <TableCell>Updated at</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{(pageNumber - 1) * pageSize + index + 1}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.password}</TableCell>
                                        <TableCell>{user.created_at}</TableCell>
                                        <TableCell>{user.updated_at}</TableCell>
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
    );;
};