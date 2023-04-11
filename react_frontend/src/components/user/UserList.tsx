import React, {useEffect, useState} from "react";
import {User} from "../../models/User";
import {BACKEND_API_URL} from "../../constants";
import {Link} from "react-router-dom";
import {
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    CircularProgress,
    IconButton,
    Tooltip,
    Container, Typography, Box, TableSortLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add"
import ReadMoreIcon from "@mui/icons-material/ReadMore"
import EditIcon from "@mui/icons-material/Edit"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import axios from "axios";
import {UserDelete} from "./UserDelete";

export const UserList = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [refreshUsers, setRefreshUsers] = useState(false);

    useEffect(() => {
        setLoading(true);
        setRefreshUsers(false);
        axios.get(`${BACKEND_API_URL}/users/`)
            .then((response) => {
                setUsers(response.data);
                setLoading(false);
            });
    }, [refreshUsers]);

    const [orderColumn, setOrderColumn] = useState("id");
    const [orderDirection, setOrderDirection] = useState("asc");

    const handleSort = (column: string) => {
        let newOrderColumn = column;
        let newOrderDirection = "asc";
        if (column == orderColumn) {
            if (orderDirection == "asc") {
                newOrderDirection = "desc";
            } else {
                newOrderColumn = "id";
                newOrderDirection = "asc";
                (document.activeElement as HTMLElement).blur();
            }
        }
        setOrderColumn(newOrderColumn);
        setOrderDirection(newOrderDirection);
    };

    const sortedInfo = (column: string, direction: string) => {
        const info = users.map((user: User, index) => {
            return {
                index: index + 1,
                ...user
            }
        });
        return info.sort((a, b) => {
            if (direction == "asc")
                return (a[column] < b[column]) ? -1 : 1;
            else
                return (a[column] > b[column]) ? -1 : 1;
        });
    };

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [userId, setUserId] = useState<number>();

    const handleDelete = (value: number) => {
        setUserId(value);
        setOpenDeleteDialog(true);
    }

    const handleOnClose = (wasDeleted: boolean) => {
        setOpenDeleteDialog(false);
        if (wasDeleted)
            setRefreshUsers(true);
    }

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3}}>
            <Typography variant={"h3"} align={"center"}>Users List</Typography>
            {loading && (
                <Box>
                    <CircularProgress sx={{mt: 3}}/>
                </Box>
            )}
            {!loading && (
                <>
                    <IconButton component={Link} to={`/users/add`}>
                        <Tooltip title="Add user" arrow>
                            <AddIcon color="primary" fontSize={"large"}/>
                        </Tooltip>
                    </IconButton>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell key={"id"}>
                                    </TableCell>
                                    <TableCell key={"username"}>
                                        <TableSortLabel
                                            active={orderColumn === "username"}
                                            direction={orderColumn === "username" ? orderDirection : undefined}
                                            onClick={() => handleSort("username")}
                                        >
                                            Username
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderColumn === "email"}
                                            direction={orderColumn === "email" ? orderDirection : undefined}
                                            onClick={() => handleSort("email")}
                                        >
                                            Email
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderColumn === "password"}
                                            direction={orderColumn === "password" ? orderDirection : undefined}
                                            onClick={() => handleSort("password")}
                                        >
                                            Password
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center">Operations</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedInfo(orderColumn, orderDirection).map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.index}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.password}</TableCell>
                                        <TableCell align="center" sx={{pl: 5}}>
                                            <IconButton component={Link} sx={{ mr: 3 }} to={`/user/${user.id}/details`}>
                                                <Tooltip title="View user details" arrow>
                                                    <ReadMoreIcon color="primary" />
                                                </Tooltip>
                                            </IconButton>

                                            <IconButton component={Link} sx={{ mr: 3 }} to={`/user/${user.id}/edit`}>
                                                <Tooltip title="Edit user details" arrow>
                                                    <EditIcon />
                                                </Tooltip>
                                            </IconButton>

                                            <IconButton onClick={() => handleDelete(user.id)} sx={{ mr: 3 }}>
                                                <Tooltip title="Delete user" arrow>
                                                    <DeleteForeverIcon sx={{ color: "red" }} />
                                                </Tooltip>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <UserDelete open={openDeleteDialog} userId={userId} onClose={handleOnClose}/>
                </>
            )}
        </Container>
    );
};