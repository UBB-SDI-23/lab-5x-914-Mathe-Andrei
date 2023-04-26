import React, {useEffect, useState} from "react";
import {File} from "../../models/File";
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
import {FileDelete} from "./FileDelete";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export const FileList = () => {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [refreshFiles, setRefreshFiles] = useState(false);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const itemsPerPage = 25;

    useEffect(() => {
        setLoading(true);
        setRefreshFiles(false);
        axios.get(`${BACKEND_API_URL}/files?page=${pageNumber}`)
            .then((response) => {
                setFiles(response.data);
                setLoading(false);
            })
            .catch((error) => console.log(error));
    }, [refreshFiles, pageNumber]);

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
        const info = files.map((file: File, index) => {
            return {
                index: (pageNumber - 1) * itemsPerPage + index + 1,
                ...file
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
    const [fileId, setFileId] = useState<number>(-1);

    const handleDelete = (value: number) => {
        setFileId(value);
        setOpenDeleteDialog(true);
    }

    const handleOnClose = (wasDeleted: boolean) => {
        setOpenDeleteDialog(false);
        if (wasDeleted)
            setRefreshFiles(true);
    }

    const handleOnPreviousPage = () => {
        setPageNumber(pageNumber - 1);
    };

    const handleOnNextPage = () => {
        setPageNumber(pageNumber + 1);
    };

    return (
        <Container sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3}}>
            <Typography variant={"h3"} align={"center"}>Files</Typography>
            {loading && (
                <Box>
                    <CircularProgress sx={{mt: 3}}/>
                </Box>
            )}
            {!loading && (
                <>
                    <IconButton component={Link} to={`/files/add`}>
                        <Tooltip title="Add file" arrow>
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
                                {sortedInfo(orderColumn, orderDirection).map((file) => (
                                    <TableRow key={file.id}>
                                        <TableCell>{file.index}</TableCell>
                                        <TableCell>{file.name}</TableCell>
                                        <TableCell align="center" sx={{pl: 5}}>
                                            <IconButton component={Link} sx={{ mr: 3 }} to={`/file/${file.id}/details`}>
                                                <Tooltip title="View file details" arrow>
                                                    <ReadMoreIcon color="primary" />
                                                </Tooltip>
                                            </IconButton>

                                            <IconButton component={Link} sx={{ mr: 3 }} to={`/file/${file.id}/edit`}>
                                                <Tooltip title="Edit file details" arrow>
                                                    <EditIcon />
                                                </Tooltip>
                                            </IconButton>

                                            <IconButton onClick={() => handleDelete(file.id)} sx={{ mr: 3 }}>
                                                <Tooltip title="Delete file" arrow>
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
                    <FileDelete open={openDeleteDialog} fileId={fileId} onClose={handleOnClose}/>
                </>
            )}
        </Container>
    );
};