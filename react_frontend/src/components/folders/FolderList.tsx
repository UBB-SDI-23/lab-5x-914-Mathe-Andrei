import {
    Box,
    CircularProgress,
    Container,
    IconButton,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead, TableRow, TableSortLabel,
    Tooltip,
    Typography
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import axios from "axios";
import {BACKEND_API_URL} from "../../constants";
import {Folder} from "../../models/Folder";
import {FolderDelete} from "./FolderDelete";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export const FolderList = () => {
    const [loading, setLoading] = useState(true);
    const [folders, setFolders] = useState([]);
    const [refreshFolders, setRefreshFolders] = useState(false);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const itemsPerPage = 25;

    useEffect(() => {
        setLoading(true);
        setRefreshFolders(false);
        axios.get(`${BACKEND_API_URL}/folders?page=${pageNumber}`)
            .then((response) => {
                setFolders(response.data);
                setLoading(false);
            })
            .catch((error) => console.log(error));
    }, [refreshFolders, pageNumber]);

    const [orderColumn, setOrderColumn] = useState("id");
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");

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
        // @ts-ignore
        setOrderDirection(newOrderDirection);
    };

    const sortedInfo = (column: string, direction: string) => {
        const info = folders.map((folder: Folder, index) => {
            return {
                index: (pageNumber - 1) * itemsPerPage + index + 1,
                ...folder
            }
        });
        return info.sort((a, b) => {
            if (direction == "asc")
            { // @ts-ignore
                return (a[column] < b[column]) ? -1 : 1;
            }
            else
            { // @ts-ignore
                return (a[column] > b[column]) ? -1 : 1;
            }
        });
    };

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [folderId, setFolderId] = useState<number>(-1);

    const handleDelete = (value: number) => {
        setFolderId(value);
        setOpenDeleteDialog(true);
    }

    const handleOnClose = (wasDeleted: boolean) => {
        setOpenDeleteDialog(false);
        if (wasDeleted)
            setRefreshFolders(true);
    }

    const handleOnPreviousPage = () => {
        setPageNumber(pageNumber - 1);
    };

    const handleOnNextPage = () => {
        setPageNumber(pageNumber + 1);
    };

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
            <Typography variant={"h3"} align={"center"}>Folders</Typography>
            {loading && (
                <Box>
                    <CircularProgress sx={{mt: 3}}/>
                </Box>
            )}
            {!loading && (
                <>
                    <IconButton component={Link} to={`/folders/add`}>
                        <Tooltip title="Add folder" arrow>
                            <AddIcon color="primary" fontSize={"large"}/>
                        </Tooltip>
                    </IconButton>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell key={"id"}>
                                        #
                                    </TableCell>
                                    <TableCell key={"name"}>
                                        <TableSortLabel
                                            active={orderColumn === "name"}
                                            direction={orderColumn === "name" ? orderDirection : undefined}
                                            onClick={() => handleSort("name")}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="center">Operations</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedInfo(orderColumn, orderDirection).map((folder) => (
                                    <TableRow key={folder.id}>
                                        <TableCell>{folder.index}</TableCell>
                                        <TableCell>{folder.name}</TableCell>
                                        <TableCell align="center" sx={{pl: 5}}>
                                            <IconButton component={Link} sx={{ mr: 3 }} to={`/folder/${folder.id}/details`}>
                                                <Tooltip title="View folder details" arrow>
                                                    <ReadMoreIcon color="primary" />
                                                </Tooltip>
                                            </IconButton>

                                            <IconButton component={Link} sx={{ mr: 3 }} to={`/folder/${folder.id}/edit`}>
                                                <Tooltip title="Edit folder details" arrow>
                                                    <EditIcon />
                                                </Tooltip>
                                            </IconButton>

                                            <IconButton onClick={() => handleDelete(folder.id)} sx={{ mr: 3 }}>
                                                <Tooltip title="Delete folder" arrow>
                                                    <DeleteForeverIcon sx={{ color: "red" }} />
                                                </Tooltip>
                                            </IconButton>
                                        </TableCell>
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
                    <FolderDelete open={openDeleteDialog} folderId={folderId} onClose={handleOnClose}/>
                </>
            )}
        </Container>
    );
};